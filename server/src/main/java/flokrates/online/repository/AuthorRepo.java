package flokrates.online.repository;

import flokrates.online.model.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
@Repository
public interface AuthorRepo extends JpaRepository<Author, Integer> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Author> findByEmailIgnoreCase(String email);

    Page<Author> findByAuthorNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("""
           SELECT a FROM Author a
           WHERE lower(a.authorName) LIKE lower(concat('%', :q, '%'))
              OR lower(a.email)      LIKE lower(concat('%', :q, '%'))
           """)
    Page<Author> search(@org.springframework.data.repository.query.Param("q") String q, Pageable pageable);

    void deleteAllByAuthorIdIn(List<Integer> ids);
}
