package flokrates.online.mapper;

import flokrates.online.model.Author;
import flokrates.online.model.Role;
import flokrates.online.model.dto.AuthorDto;
import flokrates.online.repository.RoleRepo;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthorMapper {
    @Mapping(target = "password", ignore = true) // Passwort nicht aus DTO übernehmen
    @Mapping(target = "roles", source = "roles")
        // Set<String> -> Set<Role>
    Author toEntity(AuthorDto dto, @Context RoleRepo roleRepo);

    @Mapping(target = "roles", source = "roles")
    AuthorDto toDto(Author author);

    default Role map(String roleName, @Context RoleRepo roleRepo) {
        return roleRepo.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName));
    }

    default String map(Role role) {
        return role.getName();
    }
}
