package flokrates.online.service;

import flokrates.online.model.Author;

import java.util.List;
import java.util.Optional;

public interface AuthorService {
    public Author saveAuthor(Author author);

    public List<Author> getAllAuthors();

    public void deleteAuthor(Integer id);

    public Optional<Author> getAuthorById(Integer id);
}
