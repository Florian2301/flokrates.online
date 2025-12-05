package flokrates.online.security;

import flokrates.online.repository.AuthorRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorDetailService implements UserDetailsService {

    private final AuthorRepo repo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var a = repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));
        var authorities = a.getRoles().stream()
                .map(r -> new SimpleGrantedAuthority(r.getName()))
                .toList();
        return User.builder()
                .username(a.getEmail())
                .password(a.getPassword()) // BCrypt hash aus DB
                .authorities(authorities)
                .accountLocked(false)
                .disabled(!a.isEnabled())
                .build();
    }
}
