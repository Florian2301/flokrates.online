package flokrates.online.service;

import flokrates.online.model.Author;
import flokrates.online.repository.AuthorRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AuthorServiceImpl implements AuthorService {
    @Autowired
    private AuthorRepo authorRepo;

    @Override
    public Author saveAuthor(Author author) {
        return authorRepo.save(author);
    }

    @Override
    public List<Author> getAllAuthors() {
        return authorRepo.findAll();
    }

    @Override
    public void deleteAuthor(Integer id) {
        authorRepo.delete(authorRepo.getReferenceById(id));
    }

    @Override
    public Optional<Author> getAuthorById(Integer id) {
        return authorRepo.findById(id);
    }
}
