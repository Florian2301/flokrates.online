package flokrates.online.repository;

import flokrates.online.model.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageAttachmentRepo extends JpaRepository<MessageAttachment, Integer> {

    List<MessageAttachment> findByMessageIdAndDeletedFalseOrderBySortOrderAscAttachmentIdAsc(Integer messageId);

    boolean existsByAttachmentIdAndMessageId(Integer attachmentId, Integer messageId);
    void deleteByMessageId(Integer messageId);
    void deleteByMessageIdIn(List<Integer> messageIds);
}
