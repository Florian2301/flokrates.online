package flokrates.online.controller;

import flokrates.online.repository.AttachmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentFileController {
    private final AttachmentRepo repo;
    private final Path uploadRoot = Path.of("uploads");


    @GetMapping("/{storageKey}")
    public ResponseEntity<Resource> serve(@PathVariable String storageKey) throws IOException {
        var att = repo.findByStorageKey(storageKey)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Attachment not found"
                ));

        Path file = uploadRoot.resolve(storageKey);
        if (!Files.exists(file)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "File not found on disk"
            );
        }

        Resource resource = new org.springframework.core.io.UrlResource(file.toUri());

        String contentType = att.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = Files.probeContentType(file);
        }
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + (att.getFileName() != null ? att.getFileName() : storageKey) + "\""
                )
                .body(resource);
    }

}
