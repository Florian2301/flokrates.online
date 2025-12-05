package flokrates.online.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "networks")
@Getter
@Setter
public class Network {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer netId;
    @Column(name = "chat_id", columnDefinition = "INT", nullable = false)
    private Integer chatId;
    @Column(name = "ref_id", columnDefinition = "INT", nullable = false)
    private Integer refId;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;

    @PrePersist
    public void prePersist() {
        dateCreated = LocalDateTime.now();
        dateModified = dateCreated;
    }

    @PreUpdate
    public void preUpdate() {
        dateModified = LocalDateTime.now();
    }

}
