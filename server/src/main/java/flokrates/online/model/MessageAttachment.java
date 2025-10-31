package flokrates.online.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_attachments")
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Integer attachmentId;

    @Column(name = "message_id", nullable = false)
    private Integer messageId;

    @Column(name = "kind", nullable = false, length = 20) // "file" | "external_url"
    private String kind;

    @Column(name = "storage_key", length = 512)
    private String storageKey;

    @Column(name = "href", length = 1024)
    private String href;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "width_px")
    private Integer widthPx;

    @Column(name = "height_px")
    private Integer heightPx;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "checksum_sha256", columnDefinition = "BINARY(32)")
    private byte[] checksumSha256;

    @Column(name = "preview_href", length = 1024)
    private String previewHref;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "TINYINT(1)")
    private boolean deleted = false;

    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;

    @Column(name = "date_modified")
    private LocalDateTime dateModified;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (dateCreated == null) dateCreated = now;
        dateModified = now;
    }

    @PreUpdate
    public void preUpdate() {
        dateModified = LocalDateTime.now();
    }

    // Getters/Setters
    public Integer getAttachmentId() { return attachmentId; }
    public void setAttachmentId(Integer attachmentId) { this.attachmentId = attachmentId; }

    public Integer getMessageId() { return messageId; }
    public void setMessageId(Integer messageId) { this.messageId = messageId; }

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public String getHref() { return href; }
    public void setHref(String href) { this.href = href; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public Integer getWidthPx() { return widthPx; }
    public void setWidthPx(Integer widthPx) { this.widthPx = widthPx; }

    public Integer getHeightPx() { return heightPx; }
    public void setHeightPx(Integer heightPx) { this.heightPx = heightPx; }

    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }

    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }

    public byte[] getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(byte[] checksumSha256) { this.checksumSha256 = checksumSha256; }

    public String getPreviewHref() { return previewHref; }
    public void setPreviewHref(String previewHref) { this.previewHref = previewHref; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }

    public LocalDateTime getDateModified() { return dateModified; }
    public void setDateModified(LocalDateTime dateModified) { this.dateModified = dateModified; }
}
