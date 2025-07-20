package flokrates.online.mapper;

import flokrates.online.model.Network;
import flokrates.online.model.dto.NetworkDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NetworkMapper {
    NetworkDto toDto(Network network);

    Network toEntity(NetworkDto networkDto);
}
