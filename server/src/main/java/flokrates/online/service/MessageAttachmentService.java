package flokrates.online.service;

import flokrates.online.model.MessageAttachment;
import flokrates.online.model.dto.MessageAttachmentDto;
import flokrates.online.repository.MessageAttachmentRepo;
import flokrates.online.repository.MessageRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageAttachmentService {

    @Autowired
    private MessageAttachmentRepo repo;
    @Autowired
    private MessageRepo messageRepo;

    private void ensureMessageExists(Integer messageId) {
        if (!messageRepo.existsById(messageId)) {
            throw new IllegalArgumentException("Message " + messageId + " existiert nicht.");
        }
    }

    private void validateKindAndFields(MessageAttachment a) {
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


    public List<MessageAttachment> list(Integer messageId) {
        ensureMessageExists(messageId);
        return repo.findByMessageIdAndDeletedFalseOrderBySortOrderAscAttachmentIdAsc(messageId);
    }

    public Optional<MessageAttachment> get(Integer messageId, Integer attachmentId) {
        ensureMessageExists(messageId);
        return repo.findById(attachmentId)
                .filter(a -> a.getMessageId().equals(messageId));
    }

    public MessageAttachment create(Integer messageId, MessageAttachment a) {
        ensureMessageExists(messageId);
        a.setMessageId(messageId);
        validateKindAndFields(a);
//        var now = LocalDateTime.now();
//        if (a.getDateCreated() == null) a.setDateCreated(now);
//        a.setDateModified(now);
        return repo.save(a);
    }

    public Optional<MessageAttachment> update(Integer messageId, Integer attachmentId, MessageAttachmentDto dto) {
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
//                    a.setDateModified(LocalDateTime.now());
                    validateKindAndFields(a);
                    return repo.save(a);
                });
    }

    public Optional<MessageAttachment> patch(Integer messageId, Integer attachmentId, Map<String, Object> updates) {
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
                            case "deleted" -> a.setDeleted(v instanceof Boolean b ? b : Integer.parseInt(v.toString()) != 0);
                            default -> {/* unbekannte Keys ignorieren oder validieren */}
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
