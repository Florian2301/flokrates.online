package flokrates.online.mapper;

import flokrates.online.model.Author;
import flokrates.online.model.dto.AuthorDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthorMapper {
    AuthorDto toDto(Author author);
    Author toEntity(AuthorDto authorDto);
}
