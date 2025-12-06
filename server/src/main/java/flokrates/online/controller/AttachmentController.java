package flokrates.online.controller;

import flokrates.online.mapper.AttachmentMapper;
import flokrates.online.model.Attachment;
import flokrates.online.model.dto.AttachmentDto;
import flokrates.online.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages/{messageId}/attachments")
@CrossOrigin(origins = "http://localhost:8081")
public class AttachmentController {

    private final AttachmentService service;
    private final AttachmentMapper mapper;
    private final Path uploadRoot = Path.of("uploads");

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentDto> uploadFile(
            @PathVariable Integer messageId,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        if (!Files.exists(uploadRoot)) {
            Files.createDirectories(uploadRoot);
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.')); // inkl. Punkt
        }

        // 👉 Storage-Key inkl. Extension
        String storageKey = UUID.randomUUID().toString() + ext;

        Path target = uploadRoot.resolve(storageKey);
        Files.copy(file.getInputStream(), target);

        Attachment att = new Attachment();
        att.setKind("file");
        att.setStorageKey(storageKey);                       // 👉 mit Ext
        att.setHref("/api/attachments/" + storageKey);       // 👉 mit Ext
        att.setContentType(file.getContentType());
        att.setFileName(originalName);
        att.setFileSizeBytes(file.getSize());

        Attachment saved = service.create(messageId, att);
        AttachmentDto dto = mapper.toDto(saved);

        return ResponseEntity
                .created(URI.create("/api/attachments/" + storageKey))
                .body(dto);
    }

    @GetMapping
    public ResponseEntity<List<AttachmentDto>> list(@PathVariable Integer messageId) {
        var result = service.list(messageId).stream().map(mapper::toDto).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<AttachmentDto> get(@PathVariable Integer messageId,
                                             @PathVariable Integer attachmentId) {
        return service.get(messageId, attachmentId)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AttachmentDto> create(@PathVariable Integer messageId,
                                                @RequestBody AttachmentDto dto) {
        dto.setMessageId(messageId);
        Attachment toSave = mapper.toEntity(dto);
        Attachment saved = service.create(messageId, toSave);
        return ResponseEntity
                .created(URI.create("/api/messages/" + messageId + "/attachments/" + saved.getAttachmentId()))
                .body(mapper.toDto(saved));
    }

    @PutMapping("/{attachmentId}")
    public ResponseEntity<AttachmentDto> update(@PathVariable Integer messageId,
                                                @PathVariable Integer attachmentId,
                                                @RequestBody AttachmentDto dto) {
        return service.update(messageId, attachmentId, dto)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{attachmentId}")
    public ResponseEntity<AttachmentDto> patch(@PathVariable Integer messageId,
                                               @PathVariable Integer attachmentId,
                                               @RequestBody Map<String, Object> updates) {
        return service.patch(messageId, attachmentId, updates)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(@PathVariable Integer messageId,
                                       @PathVariable Integer attachmentId) {
        boolean deleted = service.delete(messageId, attachmentId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
