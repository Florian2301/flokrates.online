package flokrates.online.service;

import flokrates.online.model.Network;

import java.util.List;
import java.util.Optional;

public interface NetworkService {
    Network saveNetwork(Network network);

    List<Network> getAllNetworks();

    void deleteNetwork(Integer id);

    Optional<Network> getNetworkById(Integer id);

    // public ResponseEntity<NetworkDto> updateNetwork(Integer Id, NetworkDto networkDto);

    // public ResponseEntity<NetworkDto> patchNetwork(Integer Id, Map<String, Object> updates);
}
