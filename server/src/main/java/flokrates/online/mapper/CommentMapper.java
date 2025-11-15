package flokrates.online.mapper;

import flokrates.online.model.Chat;
import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import flokrates.online.repository.ChatRepo;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    @Mapping(target = "chatId", source = "chatId")
    CommentDto toDto(Comment comment);
    //@Mapping(target = "chat", source = "chatId", qualifiedByName = "ref")
    @Mapping(target = "chatId", ignore = true)
    Comment toEntity(CommentDto commentDto);

    @Component
    @RequiredArgsConstructor
    class CommentMapperHelper {
        private final ChatRepo chatRepo;

        @Named("ref")
        public Chat ref(Integer id) {
            return chatRepo.getReferenceById(id); // kein DB-Hit, Proxy reicht
        }
    }
}
