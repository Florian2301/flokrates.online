package flokrates.online.repository;

import flokrates.online.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Integer> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Page<User> findByUsernameContaining(String username, Pageable pageable);

    @Query("""
            SELECT a FROM User a
            WHERE lower(a.username) LIKE lower(concat('%', :q, '%'))
               OR lower(a.email)      LIKE lower(concat('%', :q, '%'))
            """)
    Page<User> search(@org.springframework.data.repository.query.Param("q") String q, Pageable pageable);

    void deleteAllByIdIn(List<Integer> ids);
}
