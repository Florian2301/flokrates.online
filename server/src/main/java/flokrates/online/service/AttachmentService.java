package flokrates.online.service;

import flokrates.online.model.Attachment;
import flokrates.online.model.dto.AttachmentDto;
import flokrates.online.repository.AttachmentRepo;
import flokrates.online.repository.MessageRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepo repo;
    private final MessageRepo messageRepo;
    private final Path uploadRoot = Paths.get("uploads");

    private void ensureMessageExists(Integer messageId) {
        if (!messageRepo.existsById(messageId)) {
            throw new IllegalArgumentException("Message " + messageId + " existiert nicht.");
        }
    }

    public Attachment uploadFileAttachment(Integer messageId, MultipartFile file) throws IOException {
        ensureMessageExists(messageId);

        if (!Files.exists(uploadRoot)) {
            Files.createDirectories(uploadRoot);
        }

        String originalName = file.getOriginalFilename();
        String storageKey = java.util.UUID.randomUUID() + "-" + (originalName != null ? originalName : "file");
        Path target = uploadRoot.resolve(storageKey);

        Files.copy(file.getInputStream(), target);

        Attachment a = new Attachment();
        a.setMessageId(messageId);
        a.setKind("file");
        a.setStorageKey(storageKey);
        a.setFileName(originalName);
        a.setFileSizeBytes(file.getSize());
        a.setContentType(file.getContentType());
        // Sehr wichtig: href auf einen Download-Endpunkt setzen
        a.setHref("/api/attachments/" + storageKey);

        return repo.save(a);
    }

    private void validateKindAndFields(Attachment a) {
        if (a.getKind() == null) throw new IllegalArgumentException("kind ist erforderlich (file|external_url)");
        switch (a.getKind()) {
            case "file" -> {
                if (a.getStorageKey() == null && a.getHref() == null)
                    throw new IllegalArgumentException("file: storageKey oder href erforderlich");
            }
            case "external_url" -> {
                if (a.getHref() == null)
                    throw new IllegalArgumentException("external_url: href erforderlich");
            }
            default -> throw new IllegalArgumentException("ungültiges kind: " + a.getKind());
        }
    }


    public List<Attachment> list(Integer messageId) {
        ensureMessageExists(messageId);
        return repo.findByMessageIdOrderBySortOrderAscAttachmentIdAsc(messageId);
    }

    public Optional<Attachment> get(Integer messageId, Integer attachmentId) {
        ensureMessageExists(messageId);
        return repo.findById(attachmentId)
                .filter(a -> a.getMessageId().equals(messageId));
    }

    public Attachment create(Integer messageId, Attachment a) {
        ensureMessageExists(messageId);
        a.setMessageId(messageId);
        validateKindAndFields(a);
        return repo.save(a);
    }

    public Optional<Attachment> update(Integer messageId, Integer attachmentId, AttachmentDto dto) {
        ensureMessageExists(messageId);
        return repo.findById(attachmentId)
                .filter(a -> a.getMessageId().equals(messageId))
                .map(a -> {
                    if (dto.getKind() != null) a.setKind(dto.getKind());
                    if (dto.getStorageKey() != null) a.setStorageKey(dto.getStorageKey());
                    if (dto.getHref() != null) a.setHref(dto.getHref());
                    if (dto.getContentType() != null) a.setContentType(dto.getContentType());
                    if (dto.getFileName() != null) a.setFileName(dto.getFileName());
                    if (dto.getFileSizeBytes() != null) a.setFileSizeBytes(dto.getFileSizeBytes());
                    if (dto.getPreviewHref() != null) a.setPreviewHref(dto.getPreviewHref());
                    if (dto.getTitle() != null) a.setTitle(dto.getTitle());
                    if (dto.getDescription() != null) a.setDescription(dto.getDescription());
                    if (dto.getSortOrder() != null) a.setSortOrder(dto.getSortOrder());
                    // optional: widthPx/heightPx/durationMs/pageCount
                    if (dto.getWidthPx() != null) a.setWidthPx(dto.getWidthPx());
                    if (dto.getHeightPx() != null) a.setHeightPx(dto.getHeightPx());
                    if (dto.getDurationMs() != null) a.setDurationMs(dto.getDurationMs());
                    if (dto.getPageCount() != null) a.setPageCount(dto.getPageCount());
                    validateKindAndFields(a);
                    return repo.save(a);
                });
    }

    public Optional<Attachment> patch(Integer messageId, Integer attachmentId, Map<String, Object> updates) {
        ensureMessageExists(messageId);
        return repo.findById(attachmentId)
                .filter(a -> a.getMessageId().equals(messageId))
                .map(a -> {
                    updates.forEach((k, v) -> {
                        switch (k) {
                            case "kind" -> a.setKind((String) v);
                            case "storageKey" -> a.setStorageKey((String) v);
                            case "href" -> a.setHref((String) v);
                            case "contentType" -> a.setContentType((String) v);
                            case "fileName" -> a.setFileName((String) v);
                            case "fileSizeBytes" -> a.setFileSizeBytes(v == null ? null : ((Number) v).longValue());
                            case "previewHref" -> a.setPreviewHref((String) v);
                            case "title" -> a.setTitle((String) v);
                            case "description" -> a.setDescription((String) v);
                            case "sortOrder" -> a.setSortOrder(v == null ? null : ((Number) v).intValue());
                            case "widthPx" -> a.setWidthPx(v == null ? null : ((Number) v).intValue());
                            case "heightPx" -> a.setHeightPx(v == null ? null : ((Number) v).intValue());
                            case "durationMs" -> a.setDurationMs(v == null ? null : ((Number) v).intValue());
                            case "pageCount" -> a.setPageCount(v == null ? null : ((Number) v).intValue());
                            default -> {
                            }
                        }
                    });
                    a.setDateModified(LocalDateTime.now());
                    validateKindAndFields(a);
                    return repo.save(a);
                });
    }


    public boolean delete(Integer messageId, Integer attachmentId) {
        ensureMessageExists(messageId);
        return get(messageId, attachmentId).map(a -> {
            repo.deleteById(a.getAttachmentId());
            return true;
        }).orElse(false);
    }

    public void deleteAllForMessage(Integer messageId) {
        ensureMessageExists(messageId);
        repo.deleteByMessageId(messageId);
    }
}
