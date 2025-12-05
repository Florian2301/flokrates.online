package flokrates.online.repository;

import flokrates.online.model.Author;
import flokrates.online.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    long deleteByAuthor(Author author);

    long deleteByExpiresAtBefore(Instant time);
}