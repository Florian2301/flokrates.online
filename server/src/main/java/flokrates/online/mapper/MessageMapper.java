package flokrates.online.mapper;

import flokrates.online.model.Message;
import flokrates.online.model.dto.MessageDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageDto toDto(Message message);
    Message toEntity(MessageDto messageDto);
}
