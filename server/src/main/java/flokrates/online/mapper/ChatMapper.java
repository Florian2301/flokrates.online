package flokrates.online.mapper;

import flokrates.online.model.Chat;
import flokrates.online.model.dto.ChatDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    ChatDto toDto(Chat chat);
    Chat toEntity(ChatDto chatDto);
}