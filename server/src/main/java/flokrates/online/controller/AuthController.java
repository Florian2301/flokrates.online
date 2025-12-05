package flokrates.online.controller;

import flokrates.online.mapper.AuthorMapper;
import flokrates.online.model.Author;
import flokrates.online.model.RefreshToken;
import flokrates.online.model.dto.*;
import flokrates.online.repository.AuthorRepo;
import flokrates.online.repository.RefreshTokenRepo;
import flokrates.online.repository.RoleRepo;
import flokrates.online.security.JwtService;
import flokrates.online.security.TokenHash;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authManager;
    private final PasswordEncoder encoder;
    private final AuthorRepo authorRepo;
    private final RoleRepo roleRepo;
    private final RefreshTokenRepo rtRepo;
    private final JwtService jwt;
    private final AuthorMapper mapper;

    // Refresh-Gültigkeit (Days) – gleiche Zahl wie in application.yml verwenden
    private final long refreshDays = 30;

    @PostMapping("/register")
    public ResponseEntity<AuthorDto> register(@Valid @RequestBody AuthorCreateDto dto) {
        if (authorRepo.existsByEmail(dto.email())) {
            return ResponseEntity.badRequest().build();
        }
        var userRole = roleRepo.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("ROLE_USER not seeded"));

        var a = new Author();
        a.setAuthorName(dto.authorName());
        a.setEmail(dto.email().toLowerCase());
        a.setPassword(encoder.encode(dto.password()));
        a.setEnabled(true);
        a.getRoles().add(userRole);

        var saved = authorRepo.save(a);
        return ResponseEntity.ok(mapper().toDto(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var token = new UsernamePasswordAuthenticationToken(req.email().toLowerCase(), req.password());
        try {
            authManager.authenticate(token); // wirft bei Fehler
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "bad_credentials"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(Map.of("error", "user_disabled"));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(401).body(Map.of("error", "user_not_found"));
        }

        var author = authorRepo.findByEmail(req.email().toLowerCase()).orElseThrow();
        var roles = author.getRoles().stream().map(r -> r.getName()).collect(java.util.stream.Collectors.toSet());

        var access = jwt.generateAccessToken(author.getEmail(), roles);
        var exp = jwt.extractExpiration(access);

        // refresh token rotieren & speichern (als SHA-256 Hash)
        var rawRefresh = UUID.randomUUID().toString() + "." + UUID.randomUUID();
        var rt = new RefreshToken();
        rt.setAuthor(author);
        rt.setTokenHash(TokenHash.sha256(rawRefresh));
        rt.setIssuedAt(Instant.now());
        rt.setExpiresAt(Instant.now().plus(refreshDays, ChronoUnit.DAYS));
        rt.setRevoked(false);
        rt.setDevice(req.device());

        rtRepo.save(rt);

        return ResponseEntity.ok(new AuthResponse(
                "Bearer",
                access,
                exp,
                rawRefresh
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        var hash = TokenHash.sha256(req.refreshToken());
        var stored = rtRepo.findByTokenHash(hash).orElse(null);
        if (stored == null || stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(401).build();
        }

        var author = stored.getAuthor();
        var roles = author.getRoles().stream().map(r -> r.getName()).collect(java.util.stream.Collectors.toSet());

        // altes Refresh-Token widerrufen (Rotation)
        stored.setRevoked(true);
        rtRepo.save(stored);

        // neues Refresh-Token ausgeben
        var newRaw = UUID.randomUUID().toString() + "." + UUID.randomUUID();
        var newRt = new RefreshToken();
        newRt.setAuthor(author);
        newRt.setTokenHash(TokenHash.sha256(newRaw));
        newRt.setIssuedAt(Instant.now());
        newRt.setExpiresAt(Instant.now().plus(refreshDays, ChronoUnit.DAYS));
        newRt.setRevoked(false);
        newRt.setDevice(req.device());
        rtRepo.save(newRt);

        var access = jwt.generateAccessToken(author.getEmail(), roles);
        var exp = jwt.extractExpiration(access);

        return ResponseEntity.ok(new AuthResponse("Bearer", access, exp, newRaw));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshRequest req) {
        if (req != null && req.refreshToken() != null) {
            var hash = TokenHash.sha256(req.refreshToken());
            rtRepo.findByTokenHash(hash).ifPresent(rt -> {
                rt.setRevoked(true);
                rtRepo.save(rt);
            });
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthorDto> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return ResponseEntity.status(401).build();
        var token = authHeader.substring(7);
        if (!jwt.isValid(token)) return ResponseEntity.status(401).build();

        var email = jwt.extractSubject(token);
        var author = authorRepo.findByEmail(email).orElse(null);
        if (author == null) return ResponseEntity.status(404).build();

        return ResponseEntity.ok(mapper().toDto(author));
    }

    private AuthorMapper mapper() {
        return mapper;
    }
}
