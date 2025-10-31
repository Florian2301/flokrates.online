package flokrates.online.controller;

import flokrates.online.mapper.MessageAttachmentMapper;
import flokrates.online.model.MessageAttachment;
import flokrates.online.model.dto.MessageAttachmentDto;
import flokrates.online.service.MessageAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages/{messageId}/attachments")
@CrossOrigin(origins = "http://localhost:8081")
public class MessageAttachmentController {

    private final MessageAttachmentService service;
    private final MessageAttachmentMapper mapper;

    @GetMapping
    public ResponseEntity<List<MessageAttachmentDto>> list(@PathVariable Integer messageId) {
        var result = service.list(messageId).stream().map(mapper::toDto).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<MessageAttachmentDto> get(@PathVariable Integer messageId,
                                                    @PathVariable Integer attachmentId) {
        return service.get(messageId, attachmentId)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MessageAttachmentDto> create(@PathVariable Integer messageId,
                                                       @RequestBody MessageAttachmentDto dto) {
        dto.setMessageId(messageId);
        MessageAttachment toSave = mapper.toEntity(dto);
        MessageAttachment saved = service.create(messageId, toSave);
        return ResponseEntity
                .created(URI.create("/api/messages/" + messageId + "/attachments/" + saved.getAttachmentId()))
                .body(mapper.toDto(saved));
    }

    @PutMapping("/{attachmentId}")
    public ResponseEntity<MessageAttachmentDto> update(@PathVariable Integer messageId,
                                                       @PathVariable Integer attachmentId,
                                                       @RequestBody MessageAttachmentDto dto) {
        return service.update(messageId, attachmentId, dto)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{attachmentId}")
    public ResponseEntity<MessageAttachmentDto> patch(@PathVariable Integer messageId,
                                                      @PathVariable Integer attachmentId,
                                                      @RequestBody Map<String, Object> updates) {
        return service.patch(messageId, attachmentId, updates)
                .map(mapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> delete(@PathVariable Integer messageId,
                                       @PathVariable Integer attachmentId) {
        boolean deleted = service.delete(messageId, attachmentId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
