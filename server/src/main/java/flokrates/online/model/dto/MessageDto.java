package flokrates.online.model.dto;

import flokrates.online.model.Actor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDto {

    private Integer messageId;
    private Integer messageNumber;
    private Integer chatId;
    private Integer respId;
    private Actor actor;
    private String messageText;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
