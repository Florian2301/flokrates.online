package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuthorDto {
    private Integer authorId;
    private String authorName;
    private String email;
    private String password;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
