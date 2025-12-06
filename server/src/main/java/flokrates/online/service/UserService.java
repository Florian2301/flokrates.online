package flokrates.online.service;

import flokrates.online.model.User;
import flokrates.online.model.dto.UserDto;
import flokrates.online.repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;

    public User saveUser(User user) {
        return userRepo.save(user);
    }

    public List<User> getAllUser() {
        return userRepo.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepo.findById(id);
    }

    public Optional<User> updateUser(Integer id, UserDto dto) {
        return userRepo.findById(id).map(existing -> {
            existing.setUsername(dto.getUsername());
            existing.setEmail(dto.getEmail());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                existing.setPassword(dto.getPassword());
            }
            if (dto.getEnabled() != null) {
                existing.setEnabled(dto.getEnabled());
            }
            return userRepo.save(existing);
        });
    }

    public Optional<User> patchUser(Integer id, Map<String, Object> updates) {
        return userRepo.findById(id).map(existing -> {
            updates.forEach((k, v) -> {
                switch (k) {
                    case "username" -> existing.setUsername((String) v);
                    case "email" -> existing.setEmail((String) v);
                    case "password" -> existing.setPassword((String) v);
                    case "enabled" -> existing.setEnabled((Boolean) v);
                    default -> {
                    }
                }
            });
            return userRepo.save(existing);
        });
    }

    public boolean deleteUser(Integer id) {
        if (!userRepo.existsById(id)) return false;
        userRepo.deleteById(id);
        return true;
    }
}
