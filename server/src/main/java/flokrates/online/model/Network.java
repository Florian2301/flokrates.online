package flokrates.online.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "networks")
public class Network {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer netId;
    @Column(name = "chat_id", columnDefinition = "INT", nullable = false)
    private Integer chatId;
    @Column(name = "ref_id", columnDefinition = "INT", nullable = false)
    private Integer refId;
    @Column(name = "date_created", nullable = false)
    private LocalDateTime dateCreated;
    @Column(name = "date_modified")
    private LocalDateTime dateModified;

    // Getter and Setter
    public Integer getNetId() {
        return netId;
    }

    public void setNetId(Integer netId) {
        this.netId = netId;
    }

    public Integer getChatId() {
        return chatId;
    }

    public void setChatId(Integer chatId) {
        this.chatId = chatId;
    }

    public Integer getRefId() {
        return refId;
    }

    public void setRefId(Integer refId) {
        this.refId = refId;
    }

    public LocalDateTime getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDateTime dateCreated) {
        this.dateCreated = dateCreated;
    }

    public LocalDateTime getDateModified() {
        return dateModified;
    }

    public void setDateModified(LocalDateTime dateModified) {
        this.dateModified = dateModified;
    }
}
