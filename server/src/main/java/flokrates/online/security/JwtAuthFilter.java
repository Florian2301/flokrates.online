package flokrates.online.security;

import flokrates.online.controller.MessageController;
import flokrates.online.repository.UserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
    private final JwtService jwtService;
    private final UserRepo userRepo;

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

                var userOpt = userRepo.findByEmail(email);
                if (userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().isEnabled())) {

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
            logger.warn("JWT parsing/validation failed", ex);
        }

        chain.doFilter(req, res);
    }
}
