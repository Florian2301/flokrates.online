package flokrates.online.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Set;

@Service
public class JwtService {
    private final Key key;
    private final long accessMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-minutes}") long accessMinutes
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) { // 32 bytes = 256 bit
            throw new IllegalArgumentException(
                    "app.jwt.secret must be at least 32 bytes, but is " + keyBytes.length
            );
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessMinutes = accessMinutes;
    }

    public String generateAccessToken(String subjectEmail, Set<String> roles, Integer userId, String authorName) {
        Instant now = Instant.now();
        Instant exp = now.plus(Duration.ofMinutes(accessMinutes));
        return Jwts.builder()
                .setSubject(subjectEmail)
                .addClaims(Map.of(
                        "roles", roles,
                        "userId", userId,
                        "name", authorName
                ))
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isValid(String token) {
        try {
            parser().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractSubject(String token) {
        return parser().parseClaimsJws(token).getBody().getSubject();
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractRoles(String token) {
        Object val = parser().parseClaimsJws(token).getBody().get("roles");
        return val instanceof java.util.List<?> list
                ? list.stream().map(Object::toString).collect(java.util.stream.Collectors.toSet())
                : Set.of();
    }

    public Instant extractExpiration(String token) {
        return parser().parseClaimsJws(token).getBody().getExpiration().toInstant();
    }

    private JwtParser parser() {
        return Jwts.parserBuilder().setSigningKey(key).build();
    }
}
