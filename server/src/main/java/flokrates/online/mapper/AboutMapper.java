package flokrates.online.mapper;

import flokrates.online.model.About;
import flokrates.online.model.dto.AboutDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AboutMapper {
    AboutDto toDto(About about);
    About toEntity(AboutDto aboutDto);
}
