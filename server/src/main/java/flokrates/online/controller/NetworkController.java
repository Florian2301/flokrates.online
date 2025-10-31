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

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/networks")
@CrossOrigin(origins = "http://localhost:8081")
public class NetworkController {

    private static final Logger logger = LoggerFactory.getLogger(NetworkController.class);
    private final NetworkService networkService;
    private final NetworkMapper networkMapper;

    @PostMapping
    public ResponseEntity<NetworkDto> createNetwork(@RequestBody NetworkDto dto) {
        Network toSave = networkMapper.toEntity(dto);
        Network saved = networkService.saveNetwork(toSave);
        return ResponseEntity
                .created(URI.create("/api/networks/" + saved.getNetId()))
                .body(networkMapper.toDto(saved));
    }

    @GetMapping
    public ResponseEntity<List<NetworkDto>> getAllNetworks() {
        List<NetworkDto> result = networkService.getAllNetworks().stream()
                .map(networkMapper::toDto)
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NetworkDto> getNetworkById(@PathVariable Integer id) {
        return networkService.getNetworkById(id)
                .map(networkMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<NetworkDto> updateNetwork(@PathVariable Integer id,
                                                    @RequestBody NetworkDto dto) {
        return networkService.updateNetwork(id, dto)
                .map(n -> ResponseEntity.ok(networkMapper.toDto(n)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNetwork(@PathVariable Integer id) {
        boolean deleted = networkService.deleteNetwork(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ===== References (Subresource) =====

    @GetMapping("/by-chat/{chatId}")
    public ResponseEntity<List<NetworkDto>> getByChat(@PathVariable Integer chatId) {
        return ResponseEntity.ok(
                networkService.getReferencesForChat(chatId).stream()
                        .map(networkMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/by-ref/{chatId}")
    public ResponseEntity<List<NetworkDto>> getByRef(@PathVariable Integer chatId) {
        return ResponseEntity.ok(
                networkService.getBackReferencesForChat(chatId).stream()
                        .map(networkMapper::toDto)
                        .toList()
        );
    }

    @PostMapping("/references")
    public ResponseEntity<NetworkDto> upsertReference(@RequestBody NetworkDto dto) {
        Network saved = networkService.upsertReference(dto.getChatId(), dto.getRefId());
        return ResponseEntity.ok(networkMapper.toDto(saved));
    }

    @DeleteMapping("/references")
    public ResponseEntity<Void> deleteReference(@RequestParam Integer chatId,
                                                @RequestParam Integer refId) {
        networkService.deleteReference(chatId, refId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<NetworkDto> patchNetwork(@PathVariable Integer id,
                                                   @RequestBody Map<String, Object> updates) {
        return networkService.patchNetwork(id, updates)
                .map(n -> ResponseEntity.ok(networkMapper.toDto(n)))
                .orElse(ResponseEntity.notFound().build());
    }
}
