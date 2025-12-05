package flokrates.online.security;

import flokrates.online.repository.AuthorRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final AuthorRepo authorRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            // Kein Token -> öffentl. Endpunkte sollen weiterhin funktionieren
            chain.doFilter(req, res);
            return;
        }

        String token = header.substring(7);

        try {
            if (jwtService.isValid(token)) {
                String email = jwtService.extractSubject(token);

                var authorOpt = authorRepo.findByEmail(email);
                if (authorOpt.isPresent() && Boolean.TRUE.equals(authorOpt.get().isEnabled())) {

                    // Rollen aus dem Token holen und für hasRole(...) mit ROLE_-Prefix ausstatten
                    List<SimpleGrantedAuthority> authorities = jwtService.extractRoles(token).stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                            .map(SimpleGrantedAuthority::new)
                            .toList();

                    var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (Exception ex) {
            // Wichtig: keine 403 hier auslösen – öffentliche GETs sollen weiterlaufen
            // Optional: logger.warn("JWT parsing/validation failed", ex);
        }

        chain.doFilter(req, res);
    }
}
