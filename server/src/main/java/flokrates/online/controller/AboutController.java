package flokrates.online.controller;

import flokrates.online.mapper.AboutMapper;
import flokrates.online.model.About;
import flokrates.online.model.Language;
import flokrates.online.model.dto.AboutDto;
import flokrates.online.service.AboutService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/abouts")
@CrossOrigin(origins = "http://localhost:8081")
public class AboutController {
    private static final Logger logger = LoggerFactory.getLogger(AboutController.class);

    private final AboutService aboutService;
    private final AboutMapper aboutMapper;

    @PostMapping
    public ResponseEntity<AboutDto> createAbout(@RequestBody AboutDto dto) {
        About entity = aboutMapper.toEntity(dto);
        if (entity.getDateCreated() == null) {
            entity.setDateCreated(LocalDateTime.now());
        }
        entity.setDateModified(LocalDateTime.now());

        About created = aboutService.save(entity);
        AboutDto body = aboutMapper.toDto(created);
        return ResponseEntity
                .created(URI.create("/api/abouts/" + created.getId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<AboutDto>> getAll() {
        List<AboutDto> list = aboutService.findAll().stream()
                .map(aboutMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AboutDto> getById(@PathVariable Integer id) {
        return aboutService.findById(id)
                .map(aboutMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/section/{key}")
    public ResponseEntity<List<AboutDto>> getBySection(@PathVariable String key) {
        List<AboutDto> list = aboutService.findBySection(key).stream()
                .map(aboutMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }


    @PutMapping("/{id}")
    public ResponseEntity<AboutDto> update(@PathVariable Integer id, @RequestBody AboutDto dto) {
        Optional<About> existingOpt = aboutService.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        About existing = existingOpt.get();
        existing.setTitle(dto.getTitle());
        existing.setSectionKey(dto.getSectionKey());
        existing.setText(dto.getText());
        existing.setLanguage(dto.getLanguage());
        existing.setDateModified(LocalDateTime.now());

        About updated = aboutService.save(existing);
        return ResponseEntity.ok(aboutMapper.toDto(updated));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AboutDto> patch(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<About> existingOpt = aboutService.findById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();

        About existing = existingOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "sectionKey" -> existing.setSectionKey((String) value);
                case "title" -> existing.setTitle((String) value);
                case "text" -> existing.setText((String) value);
                case "language" -> {
                    if (value != null) existing.setLanguage(Language.valueOf(value.toString()));
                }
                // dateCreated/dateModified werden nicht direkt gepatcht
            }
        });
        existing.setDateModified(LocalDateTime.now());

        About updated = aboutService.save(existing);
        return ResponseEntity.ok(aboutMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        boolean deleted = aboutService.delete(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
