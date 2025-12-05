package flokrates.online.mapper;

import flokrates.online.model.Role;
import flokrates.online.model.User;
import flokrates.online.model.dto.UserDto;
import flokrates.online.repository.RoleRepo;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", source = "roles")
    User toEntity(UserDto dto, @Context RoleRepo roleRepo);

    @Mapping(target = "roles", source = "roles")
    UserDto toDto(User user);

    default Role map(String roleName, @Context RoleRepo roleRepo) {
        return roleRepo.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName));
    }

    default String map(Role role) {
        return role.getName();
    }
}
