package flokrates.online.model.dto;

import java.time.Instant;

public record RefreshTokenDto(
        Long tokenId,
        Instant issuedAt,
        Instant expiresAt,
        boolean revoked,
        String device
) {
}