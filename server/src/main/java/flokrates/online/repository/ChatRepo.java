package flokrates.online.repository;

import flokrates.online.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ChatRepo extends JpaRepository<Chat, Integer> {
    List<Chat> findAllByChatIdIn(Collection<Integer> ids);
}

