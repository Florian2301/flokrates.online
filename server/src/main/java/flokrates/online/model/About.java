package flokrates.online.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "about")
@Getter
@Setter
public class About {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "section_key", length = 50, nullable = false)
    private String sectionKey;
    @Column(name = "title", nullable = false)
    private String title;
    // TEXT-Spalte – per columnDefinition erzwingen
    @Column(name = "text", columnDefinition = "TEXT", nullable = false)
    private String text;
    @Enumerated(EnumType.STRING)
    @Column(name = "language", length = 2, nullable = false)
    private Language language;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;
}
