package flokrates.online.controller;

import flokrates.online.mapper.AuthorMapper;
import flokrates.online.model.Author;
import flokrates.online.model.dto.AuthorDto;
import flokrates.online.repository.RoleRepo;
import flokrates.online.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:8081")
@Validated
public class AuthorController {
    private static final Logger logger = LoggerFactory.getLogger(AuthorController.class);
    private final AuthorService authorService;
    private final AuthorMapper authorMapper;
    private final RoleRepo roleRepo;

    @PostMapping
    public ResponseEntity<AuthorDto> createAuthor(@RequestBody AuthorDto dto) {
        Author entity = authorMapper.toEntity(dto, roleRepo);
        Author created = authorService.saveAuthor(entity);
        AuthorDto body = authorMapper.toDto(created);
        return ResponseEntity
                .created(URI.create("/api/authors/" + created.getAuthorId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<AuthorDto>> getAllAuthors() {
        List<AuthorDto> list = authorService.getAllAuthors().stream()
                .map(authorMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDto> getAuthorByID(@PathVariable Integer id) {
        return authorService.getAuthorById(id)
                .map(authorMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorDto> updateAuthor(@PathVariable Integer id,
                                                  @RequestBody AuthorDto dto) {
        return authorService.updateAuthor(id, dto)
                .map(authorMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AuthorDto> patchAuthor(@PathVariable Integer id,
                                                 @RequestBody Map<String, Object> updates) {
        return authorService.patchAuthor(id, updates)
                .map(authorMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Integer id) {
        boolean deleted = authorService.deleteAuthor(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
