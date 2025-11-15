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
    CommentDto toDto(Comment comment);
    Comment toEntity(CommentDto commentDto);
}
