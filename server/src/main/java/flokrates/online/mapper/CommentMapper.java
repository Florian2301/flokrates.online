package flokrates.online.mapper;

import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    CommentDto toDto(Comment comment);
    Comment toEntity(CommentDto commentDto);
}
