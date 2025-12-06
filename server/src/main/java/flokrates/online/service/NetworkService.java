package flokrates.online.service;

import flokrates.online.model.Network;
import flokrates.online.model.dto.NetworkDto;
import flokrates.online.repository.NetworkRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class NetworkService {

    private final NetworkRepo networkRepo;

    public Network saveNetwork(Network network) {
        return networkRepo.save(network);
    }

    public List<Network> getAllNetworks() {
        return networkRepo.findAll();
    }

    public Optional<Network> getNetworkById(Integer id) {
        return networkRepo.findById(id);
    }

    public Optional<Network> updateNetwork(Integer id, NetworkDto dto) {
        return networkRepo.findById(id).map(n -> {
            n.setChatId(dto.getChatId());
            n.setRefId(dto.getRefId());
            return networkRepo.save(n);
        });
    }

    public boolean deleteNetwork(Integer id) {
        if (!networkRepo.existsById(id)) return false;
        networkRepo.deleteById(id);
        return true;
    }

    public Optional<Network> patchNetwork(Integer id, Map<String, Object> updates) {
        return networkRepo.findById(id).map(n -> {
            updates.forEach((k, v) -> {
                switch (k) {
                    case "chatId" -> n.setChatId((Integer) v);
                    case "refId" -> n.setRefId((Integer) v);
                }
            });
            return networkRepo.save(n);
        });
    }

    // References
    public List<Network> getReferencesForChat(Integer chatId) {
        return networkRepo.findByChatId(chatId);
    }

    public List<Network> getBackReferencesForChat(Integer chatId) {
        return networkRepo.findByRefId(chatId);
    }

    public boolean referenceExists(Integer chatId, Integer refId) {
        return networkRepo.existsByChatIdAndRefId(chatId, refId);
    }

    public Network upsertReference(Integer chatId, Integer refId) {
        if (chatId.equals(refId)) {
            throw new IllegalArgumentException("chatId und refId dürfen nicht identisch sein.");
        }

        // hier gleich das Repo sinnvoll nutzen (siehe Punkt 3)
        return networkRepo.findByChatIdAndRefId(chatId, refId)
                .orElseGet(() -> {
                    Network n = new Network();
                    n.setChatId(chatId);
                    n.setRefId(refId);
                    return networkRepo.save(n);
                });
    }

    public void deleteReference(Integer chatId, Integer refId) {
        networkRepo.findByChatId(chatId).stream()
                .filter(n -> n.getRefId().equals(refId))
                .forEach(n -> networkRepo.deleteById(n.getNetId()));
    }
}
