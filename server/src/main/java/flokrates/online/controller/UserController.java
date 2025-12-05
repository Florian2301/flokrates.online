package flokrates.online.controller;

import flokrates.online.mapper.UserMapper;
import flokrates.online.model.User;
import flokrates.online.model.dto.UserDto;
import flokrates.online.repository.RoleRepo;
import flokrates.online.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:8081")
@Validated
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final RoleRepo roleRepo;

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto dto) {
        User entity = userMapper.toEntity(dto, roleRepo);
        User created = userService.saveUser(entity);
        UserDto body = userMapper.toDto(created);
        return ResponseEntity
                .created(URI.create("/api/authors/" + created.getId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUser() {
        List<UserDto> list = userService.getAllUser().stream()
                .map(userMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserByID(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Integer id,
                                              @RequestBody UserDto dto) {
        return userService.updateUser(id, dto)
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDto> patchUser(@PathVariable Integer id,
                                             @RequestBody Map<String, Object> updates) {
        return userService.patchUser(id, updates)
                .map(userMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        boolean deleted = userService.deleteUser(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
