package flokrates.online.repository;

import flokrates.online.model.Network;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkRepo extends JpaRepository<Network, Integer> {
    List<Network> findByChatId(Integer chatId);
    List<Network> findByRefId(Integer refId);
}
