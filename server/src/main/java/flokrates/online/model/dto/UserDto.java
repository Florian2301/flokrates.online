package flokrates.online.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserDto {
    private Integer userId;
    private String username;
    private String email;
    private String password;
    Boolean enabled;
    Set<String> roles;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
