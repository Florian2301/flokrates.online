package flokrates.online.repository;

import flokrates.online.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Integer> {
    List<Comment> findByChatId(Integer chatId);
    Page<Comment> findByChatId(Integer chatId, Pageable pageable);
    List<Comment> findByChatIdOrderByDateCreatedDesc(Integer chatId);
    void deleteByChatId(Integer chatId);
    Page<Comment> findByChatIdAndSenderIgnoreCase(Integer chatId, String sender, Pageable pageable);

}
