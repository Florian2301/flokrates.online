package flokrates.online.service;

import flokrates.online.model.Network;
import flokrates.online.repository.NetworkRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NetworkServiceImpl implements NetworkService {
    @Autowired
    private NetworkRepo networkRepo;
    @Override
    public Network saveNetwork(Network network) {
        return networkRepo.save(network);
    }
    @Override
    public List<Network> getAllNetworks() {
        return networkRepo.findAll();
    }
    @Override
    public void deleteNetwork(Integer id) {
        networkRepo.delete(networkRepo.getReferenceById(id));
    }
    @Override
    public Optional<Network> getNetworkById(Integer id) {
        return networkRepo.findById(id);
    }
    @Override
    public List<Network> getReferencesForChat(Integer chatId) {
        return networkRepo.findByChatId(chatId);
    }
}
