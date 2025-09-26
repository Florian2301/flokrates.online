package flokrates.online.service;

import flokrates.online.model.Author;

import java.util.List;
import java.util.Optional;

public interface AuthorService {
    Author saveAuthor(Author author);

    List<Author> getAllAuthors();

    void deleteAuthor(Integer id);

    Optional<Author> getAuthorById(Integer id);
}
