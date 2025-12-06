package flokrates.online.repository;

import flokrates.online.model.Network;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NetworkRepo extends JpaRepository<Network, Integer> {
    void deleteByChatId(Integer chatId);

    void deleteByRefId(Integer refId);

    void deleteByChatIdAndRefId(Integer chatId, Integer refId);

    List<Network> findByChatId(Integer chatId);

    List<Network> findByRefId(Integer refId);

    boolean existsByChatIdAndRefId(Integer chatId, Integer refId);

    Optional<Network> findByChatIdAndRefId(Integer chatId, Integer refId);
}
