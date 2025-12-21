package flokrates.online.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptGenerator {
    public static void main(String[] args) {
        String raw = "Flokrates2301$3";
        String hash = "$2a$12$FZVQMXodhqom/1L3zcIA0O38y7jo/KvY/lfvXmbX0itxhAX2hyOaC";
        System.out.println(new BCryptPasswordEncoder().matches(raw, hash));
    }

    /*public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder(12).encode("Flokrates2301"));
    }*/
}
