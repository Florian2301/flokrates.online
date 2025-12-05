package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class AuthorDto {
    private Integer authorId;
    private String authorName;
    private String email;
    private String password;
    Boolean enabled;
    Set<String> roles;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
