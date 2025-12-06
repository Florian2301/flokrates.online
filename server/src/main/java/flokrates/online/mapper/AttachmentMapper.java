package flokrates.online.mapper;

import flokrates.online.model.Attachment;
import flokrates.online.model.dto.AttachmentDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    // ---- Einzelobjekte ----
    @Mapping(target = "checksumSha256Hex", expression = "java(toHex(entity.getChecksumSha256()))")
    AttachmentDto toDto(Attachment entity);

    @Mapping(target = "checksumSha256", expression = "java(fromHex(dto.getChecksumSha256Hex()))")
    Attachment toEntity(AttachmentDto dto);

    // ---- Listen ----
    List<AttachmentDto> toDtoList(List<Attachment> entities);

    List<Attachment> toEntityList(List<AttachmentDto> dtos);

    // ---- Hilfsfunktionen für Hex-Konvertierung ----
    default String toHex(byte[] bytes) {
        if (bytes == null) return null;
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    default byte[] fromHex(String hex) {
        if (hex == null || hex.isBlank()) return null;
        int len = hex.length();
        if (len % 2 != 0) throw new IllegalArgumentException("Invalid hex length: " + len);
        byte[] out = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            out[i / 2] = (byte) Integer.parseInt(hex.substring(i, i + 2), 16);
        }
        return out;
    }
}
