package flokrates.online.controller;

import flokrates.online.mapper.NetworkMapper;
import flokrates.online.model.Network;
import flokrates.online.model.dto.NetworkDto;
import flokrates.online.service.NetworkService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/networks")
@CrossOrigin(origins = "http://localhost:8081")
public class NetworkController {

    private static final Logger logger = LoggerFactory.getLogger(NetworkController.class);
    private final NetworkService networkService;
    private final NetworkMapper networkMapper;

    @PostMapping
    public String adNetwork(@RequestBody Network network) {
        networkService.saveNetwork(network);
        return "New Network " + network.getNetId() + " is added";
    }

    @GetMapping
    public List<Network> getAllNetworks() {
        return networkService.getAllNetworks();
    }

    @DeleteMapping("/{id}")
    public String deleteNetwork(@PathVariable("id") Integer id) {
        networkService.deleteNetwork(id);
        return "Network " + id + " deleted";
    }

    @GetMapping("/{id}")
    public ResponseEntity<NetworkDto> getNetworkById(@PathVariable Integer id) {
        return networkService.getNetworkById(id)
                .map(networkMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<NetworkDto> updateNetwork(@PathVariable Integer id, @RequestBody NetworkDto networkDto) {
        Optional<Network> existingNetworkOpt = networkService.getNetworkById(id);

        if (existingNetworkOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Network existingNetwork = existingNetworkOpt.get();
        existingNetwork.setChatId(networkDto.getChatId());
        existingNetwork.setRefId(networkDto.getRefId());
        existingNetwork.setDateModified(LocalDateTime.now());

        Network updatedNetwork = networkService.saveNetwork(existingNetwork);
        NetworkDto updatedDto = networkMapper.toDto(updatedNetwork);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<NetworkDto> patchNetwork(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Network> existingNetworkOpt = networkService.getNetworkById(id);

        if (existingNetworkOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Network existingNetwork = existingNetworkOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "chatId" -> existingNetwork.setChatId((Integer) value);
                case "refId" -> existingNetwork.setRefId((Integer) value);
            }
        });
        existingNetwork.setDateModified(LocalDateTime.now());

        Network updatedNetwork = networkService.saveNetwork(existingNetwork);
        NetworkDto updatedDto = networkMapper.toDto(updatedNetwork);
        return ResponseEntity.ok(updatedDto);
    }
}
