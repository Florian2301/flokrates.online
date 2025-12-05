package flokrates.online.mapper;

import flokrates.online.model.About;
import flokrates.online.model.dto.AboutDto;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface AboutMapper {
    AboutDto toDto(About about);

    About toEntity(AboutDto aboutDto);
}
