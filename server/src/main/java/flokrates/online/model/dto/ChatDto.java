package flokrates.online.model.dto;

import flokrates.online.model.Language;
import flokrates.online.model.Status;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatDto {
    private Integer chatId;
    private Integer chatNumber;
    private String title;
    private String tags;
    private String description;
    private Language language;
    private Status status;
    private LocalDateTime datePublished;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
