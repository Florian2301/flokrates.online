package flokrates.online.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
@Getter
@Setter
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer chatId;
    @Column(name = "chat_number", columnDefinition = "INT")
    private Integer chatNumber;
    @Column(name = "title", nullable = false)
    private String title;
    @Column(name = "tags")
    private String tags;
    @Column(name = "description")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(name = "language", length = 2, nullable = false)
    private Language language;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 2, nullable = false)
    private Status status;
    @Column(name = "author_id", columnDefinition = "INT")
    private Integer authorId;
    @Column(name = "date_published")
    private LocalDateTime datePublished;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;
}