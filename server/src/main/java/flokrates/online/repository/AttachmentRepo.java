package flokrates.online.repository;

import flokrates.online.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepo extends JpaRepository<Attachment, Integer> {

    List<Attachment> findByMessageIdOrderBySortOrderAscAttachmentIdAsc(Integer messageId);

    boolean existsByAttachmentIdAndMessageId(Integer attachmentId, Integer messageId);

    void deleteByMessageId(Integer messageId);

    void deleteByMessageIdIn(List<Integer> messageIds);

    Optional<Attachment> findByStorageKey(String storageKey);

}
