package flokrates.online.model.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageAttachmentDto {
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

    private String previewHref;
    private String title;
    private String description;

    private Integer sortOrder;
    private boolean deleted;

    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
