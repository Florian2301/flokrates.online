package flokrates.online.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_attachments")
@Getter
@Setter
public class Attachment {
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
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
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

}
