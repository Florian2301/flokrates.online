package flokrates.online.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer messageId;
    @Column(name = "message_number", columnDefinition = "INT", nullable = false)
    private Integer messageNumber;
    @Column(name = "chat_id", columnDefinition = "INT", nullable = false)
    private Integer chatId;
    @Column(name = "resp_id", columnDefinition = "INT")
    private Integer respId;
    @Enumerated(EnumType.STRING)
    @Column(name = "actor", length = 2, nullable = false)
    private Actor actor;
    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;
}
