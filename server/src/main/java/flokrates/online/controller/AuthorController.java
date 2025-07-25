package flokrates.online.controller;

import flokrates.online.mapper.AuthorMapper;
import flokrates.online.model.Author;
import flokrates.online.model.dto.AuthorDto;
import flokrates.online.service.AuthorService;
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
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:8081")
public class AuthorController {
    private static final Logger logger = LoggerFactory.getLogger(AuthorController.class);
    private final AuthorService authorService;
    private final AuthorMapper authorMapper;

    @PostMapping
    public String addAuthor(@RequestBody Author author) {
        authorService.saveAuthor(author);
        return "New Author " + author.getAuthorId() + " is added";
    }

    @GetMapping
    public List<Author> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    @DeleteMapping("/{id}")
    public String deleteAuthor(@PathVariable Integer id) {
        authorService.deleteAuthor(id);
        return "Author " + id + " deleted";
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDto> getAuthorByID(@PathVariable Integer id) {
        return authorService.getAuthorById(id)
                .map(authorMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorDto> updateAuthor(@PathVariable Integer id, @RequestBody AuthorDto authorDto) {
        Optional<Author> existingAuthorOpt = authorService.getAuthorById(id);

        if (existingAuthorOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Author existingAuthor = existingAuthorOpt.get();
        existingAuthor.setAuthorName(authorDto.getAuthorName());
        existingAuthor.setEmail(authorDto.getEmail());
        existingAuthor.setPassword(authorDto.getPassword());
        existingAuthor.setDateModified(LocalDateTime.now());

        Author updatedAuthor = authorService.saveAuthor(existingAuthor);
        AuthorDto updatedDto = authorMapper.toDto(updatedAuthor);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AuthorDto> patchAuthor(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Author> existingAuthorOpt = authorService.getAuthorById(id);

        if (existingAuthorOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Author existingAuthor = existingAuthorOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "authorName" -> existingAuthor.setAuthorName((String) value);
                case "email" -> existingAuthor.setEmail((String) value);
                case "password" -> existingAuthor.setPassword((String) value);
            }
        });
        existingAuthor.setDateModified(LocalDateTime.now());

        Author updatedAuthor = authorService.saveAuthor(existingAuthor);
        AuthorDto updatedDto = authorMapper.toDto(updatedAuthor);
        return ResponseEntity.ok(updatedDto);
    }
}
