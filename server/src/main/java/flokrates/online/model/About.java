package flokrates.online.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "about")
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

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSectionKey() { return sectionKey; }
    public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public Language getLanguage() { return language; }
    public void setLanguage(Language language) { this.language = language; }

    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }

    public LocalDateTime getDateModified() { return dateModified; }
    public void setDateModified(LocalDateTime dateModified) { this.dateModified = dateModified; }
}
