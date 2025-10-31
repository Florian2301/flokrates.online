package flokrates.online.mapper;

import flokrates.online.model.Network;
import flokrates.online.model.dto.NetworkDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NetworkMapper {
    NetworkDto toDto(Network network);
    Network toEntity(NetworkDto networkDto);
    List<NetworkDto> toDtoList(List<Network> networks);
    List<Network> toEntityList(List<NetworkDto> dtos);
}
