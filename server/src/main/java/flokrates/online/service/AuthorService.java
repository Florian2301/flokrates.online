package flokrates.online.service;

import flokrates.online.mapper.AuthorMapper;
import flokrates.online.mapper.AuthorMapperImpl;
import flokrates.online.model.Author;
import flokrates.online.model.dto.AuthorDto;
import flokrates.online.repository.AuthorRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthorService {
    @Autowired
    private AuthorRepo authorRepo;

    public Author saveAuthor(Author author) {
        if (author.getDateCreated() == null) {
            author.setDateCreated(LocalDateTime.now());
        }
        author.setDateModified(LocalDateTime.now());
        return authorRepo.save(author);
    }

    public List<Author> getAllAuthors() {
        return authorRepo.findAll();
    }

    public Optional<Author> getAuthorById(Integer id) {
        return authorRepo.findById(id);
    }

    public Optional<Author> updateAuthor(Integer id, AuthorDto dto) {
        return authorRepo.findById(id).map(existing -> {
            existing.setAuthorName(dto.getAuthorName());
            existing.setEmail(dto.getEmail());
            if (dto.getPassword() != null) {
                existing.setPassword(dto.getPassword());
            }
            existing.setDateModified(LocalDateTime.now());
            return authorRepo.save(existing);
        });
    }

    public Optional<Author> patchAuthor(Integer id, Map<String, Object> updates) {
        return authorRepo.findById(id).map(existing -> {
            // Whitelist (nur erlaubte Keys)
            updates.forEach((k, v) -> {
                switch (k) {
                    case "authorName" -> existing.setAuthorName((String) v);
                    case "email"      -> existing.setEmail((String) v);
                    case "password"   -> existing.setPassword((String) v); // TODO: Hashen
                    // weitere erlaubte Felder hier ergänzen
                    default -> {
                        // Unbekannte Keys ignorieren oder Exception werfen – je nach Policy
                    }
                }
            });
            existing.setDateModified(LocalDateTime.now());
            return authorRepo.save(existing);
        });
    }
    public boolean deleteAuthor(Integer id) {
        if (!authorRepo.existsById(id)) return false;
        authorRepo.deleteById(id);
        return true;
    }
}
