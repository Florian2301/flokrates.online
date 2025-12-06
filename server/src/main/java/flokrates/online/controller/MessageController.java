package flokrates.online.controller;

import flokrates.online.mapper.MessageMapper;
import flokrates.online.model.Message;
import flokrates.online.model.dto.MessageDto;
import flokrates.online.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:8081")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
    private final MessageService messageService;
    private final MessageMapper messageMapper;

    @PostMapping
    public ResponseEntity<MessageDto> createMessage(@RequestBody MessageDto dto) {
        // DTO → Entity
        Message entity = messageMapper.toEntity(dto);

        // Service speichert und vergibt ggf. messageNumber/Timestamps
        Message created = messageService.createMessage(entity);

        // Entity → DTO
        MessageDto body = messageMapper.toDto(created);

        return ResponseEntity
                .created(URI.create("/api/messages/" + created.getMessageId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<MessageDto>> getAllMessages() {
        List<MessageDto> list = messageService.getAllMessages().stream()
                .map(messageMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDto> getMessageById(@PathVariable Integer id) {
        return messageService.getMessageById(id)
                .map(messageMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDto>> getMessagesForChat(@PathVariable Integer chatId) {
        return ResponseEntity.ok(
                messageService.getMessagesByChat(chatId).stream()
                        .map(messageMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/chat/{chatId}/paged")
    public ResponseEntity<Page<MessageDto>> getMessagesForChatPaged(@PathVariable Integer chatId,
                                                                    @PageableDefault(size = 50, sort = "messageNumber") Pageable pageable) {
        Page<MessageDto> page = messageService.getMessagesByChat(chatId, pageable)
                .map(messageMapper::toDto);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDto> updateMessage(@PathVariable Integer id,
                                                    @RequestBody MessageDto dto) {
        return messageService.updateMessage(id, dto)
                .map(messageMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MessageDto> patchMessage(@PathVariable Integer id,
                                                   @RequestBody Map<String, Object> updates) {
        return messageService.patchMessage(id, updates)
                .map(messageMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer id) {
        boolean deleted = messageService.deleteMessage(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/chat/{chatId}")
    public ResponseEntity<Void> deleteMessagesForChat(@PathVariable Integer chatId) {
        messageService.deleteMessagesByChatId(chatId);
        return ResponseEntity.noContent().build();
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<MessageDto> updateMessage(@PathVariable Integer id, @RequestBody MessageDto messageDto) {
//        Optional<Message> existingMessageOpt = messageService.getMessageById(id);
//
//        if (existingMessageOpt.isEmpty())
//            return ResponseEntity.notFound().build();
//
//        Message existingMessage = existingMessageOpt.get();
//        existingMessage.setMessageNumber(messageDto.getMessageNumber());
//        existingMessage.setChatId(messageDto.getChatId());
//        existingMessage.setRespId(messageDto.getRespId());
//        existingMessage.setActor(messageDto.getActor());
//        existingMessage.setMessageText(messageDto.getMessageText());
//        existingMessage.setDateModified(LocalDateTime.now());
//
//        Message updatedMessage = messageService.saveMessage(existingMessage);
//        MessageDto updatedDto = messageMapper.toDto(updatedMessage);
//        return ResponseEntity.ok(updatedDto);
//    }
//
//    @PatchMapping("/{id}")
//    public ResponseEntity<MessageDto> patchMessage(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
//        Optional<Message> existingMessageOpt = messageService.getMessageById(id);
//
//        if (existingMessageOpt.isEmpty())
//            return ResponseEntity.notFound().build();
//
//        Message existingMessage = existingMessageOpt.get();
//        updates.forEach((key, value) -> {
//            switch (key) {
//                case "messageNumber" -> existingMessage.setMessageNumber((Integer) value);
//                case "respId" -> existingMessage.setRespId((Integer) value);
//                case "actor" -> existingMessage.setActor(Actor.valueOf((String) value ));
//                case "messageText" -> existingMessage.setMessageText((String) value);
//            }
//        });
//        existingMessage.setDateModified(LocalDateTime.now());
//
//        Message updatedMessage = messageService.saveMessage(existingMessage);
//        MessageDto updatedDto = messageMapper.toDto(updatedMessage);
//        return ResponseEntity.ok(updatedDto);
//    }

}
