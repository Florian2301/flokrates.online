package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NetworkDto {

    private Integer netId;
    private Integer chatId;
    private Integer refId;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
