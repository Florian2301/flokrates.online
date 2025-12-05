package flokrates.online.repository;

import flokrates.online.model.RefreshToken;
import flokrates.online.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    long deleteByUser(User user);

    long deleteByExpiresAtBefore(Instant time);
}