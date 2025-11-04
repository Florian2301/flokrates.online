package flokrates.online.model.dto;

import flokrates.online.model.Language;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AboutDto {
    private Integer id;
    private String sectionKey;
    private String title;
    private String text;
    private Language language;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
}
