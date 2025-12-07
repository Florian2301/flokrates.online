package flokrates.online.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments", indexes = {
        @Index(name = "ix_comments_chat", columnList = "chat_id"),
        @Index(name = "ix_comments_chat_created", columnList = "chat_id,date_created")
})
@Getter
@Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer commentId;
    @Column(name = "chat_id", nullable = false)
    private Integer chatId;
    @Column(name = "sender", length = 25, nullable = false)
    private String sender;
    @JsonProperty("isAdmin")
    @Column(name = "is_admin", nullable = false)
    private boolean isAdmin;
    @Column(name = "comment_text", columnDefinition = "TEXT", nullable = false)
    private String commentText;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;
}
