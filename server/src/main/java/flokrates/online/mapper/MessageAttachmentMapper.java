package flokrates.online.mapper;

import flokrates.online.model.MessageAttachment;
import flokrates.online.model.dto.MessageAttachmentDto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MessageAttachmentMapper {
    MessageAttachmentDto toDto(MessageAttachment entity);
    MessageAttachment toEntity(MessageAttachmentDto dto);
    List<MessageAttachmentDto> toDtoList(List<MessageAttachment> entities);
    List<MessageAttachment> toEntityList(List<MessageAttachmentDto> dtos);
}
