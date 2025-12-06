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
    @Column(name = "chat_id", nullable = false)
    private Integer chatId;
    @Column(name = "ref_id", nullable = false)
    private Integer refId;
    @CreationTimestamp
    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime dateCreated;
    @UpdateTimestamp
    @Column(name = "date_modified")
    private LocalDateTime dateModified;
}
