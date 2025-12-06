package flokrates.online.service;

import flokrates.online.model.Network;
import flokrates.online.model.dto.NetworkDto;
import flokrates.online.repository.NetworkRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class NetworkService {
    @Autowired
    private NetworkRepo networkRepo;

    public Network saveNetwork(Network network) {
//        if (network.getDateCreated() == null) {
//            network.setDateCreated(LocalDateTime.now());
//        }
//        network.setDateModified(LocalDateTime.now());
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
//            n.setDateModified(LocalDateTime.now());
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
                    // weitere erlaubte Keys hier whitelisten
                }
            });
//            n.setDateModified(LocalDateTime.now());
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

        Optional<Network> existing = networkRepo.findByChatId(chatId).stream()
                .filter(n -> n.getRefId().equals(refId))
                .findFirst();

        if (existing.isPresent()) {
            Network n = existing.get();
//            n.setDateModified(LocalDateTime.now());
            return networkRepo.save(n);
        }

        Network n = new Network();
        n.setChatId(chatId);
        n.setRefId(refId);
//        n.setDateCreated(LocalDateTime.now());
//        n.setDateModified(LocalDateTime.now());
        return networkRepo.save(n);
    }

    public void deleteReference(Integer chatId, Integer refId) {
        networkRepo.findByChatId(chatId).stream()
                .filter(n -> n.getRefId().equals(refId))
                .forEach(n -> networkRepo.deleteById(n.getNetId()));
    }
}
