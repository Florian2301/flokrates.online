package flokrates.online.repository;

import flokrates.online.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepo extends JpaRepository<Message, Integer> {
    List<Message> findByChatId(Integer chatId);
    List<Message> findByChatIdOrderByMessageNumberAsc(Integer chatId);
    Page<Message> findByChatId(Integer chatId, Pageable pageable);
    Optional<Message> findTopByChatIdOrderByMessageNumberDesc(Integer chatId);
    boolean existsByChatIdAndMessageNumber(Integer chatId, Integer messageNumber);
    Optional<Message> findByChatIdAndMessageNumber(Integer chatId, Integer messageNumber);
    void deleteByChatId(Integer chatId);

    long countByChatId(Integer chatId);
    @Query("""
        select m.chatId as chatId, count(m) as cnt
        from Message m
        where m.chatId in :chatIds
        group by m.chatId
    """)
    List<ChatCount> countByChatIds(@Param("chatIds") Collection<Integer> chatIds);
    interface ChatCount {
        Integer getChatId();
        long getCnt();
    }
}
