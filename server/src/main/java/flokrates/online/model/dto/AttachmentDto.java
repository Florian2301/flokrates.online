package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentDto {
    private Integer attachmentId;
    private Integer messageId;
    private String kind;            // "file" | "external_url"
    private String storageKey;
    private String href;
    private String contentType;
    private String fileName;
    private Long fileSizeBytes;

    private Integer widthPx;
    private Integer heightPx;
    private Integer durationMs;
    private Integer pageCount;

    private String checksumSha256Hex;
    private String previewHref;
    private String title;
    private String description;

    private Integer sortOrder;

    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
