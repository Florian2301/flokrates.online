package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDto {

    private Integer commentId;
    private Integer chatId;
    private String sender;
    private String commentText;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}