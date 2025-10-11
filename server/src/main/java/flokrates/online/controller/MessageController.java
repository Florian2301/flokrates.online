package flokrates.online.controller;

import flokrates.online.mapper.MessageMapper;
import flokrates.online.model.Actor;
import flokrates.online.model.Message;
import flokrates.online.model.dto.MessageDto;
import flokrates.online.repository.MessageRepo;
import flokrates.online.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:8081")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);
    private final MessageService messageService;
    private final MessageMapper messageMapper;
    private final MessageRepo messageRepo;

    @PostMapping
    public ResponseEntity<MessageDto> addMessage(@RequestBody Message message) {
        if (message.getDateCreated() == null) {
            message.setDateCreated(LocalDateTime.now());
        }
        Message saved = messageService.saveMessage(message);
        MessageDto dto = messageMapper.toDto(saved);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    @DeleteMapping("/{id}")
    public String deleteMessage(@PathVariable("id") Integer id) {
        messageService.deleteMessage(id);
        return "Message " + id + " deleted";
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDto> getMessageById(@PathVariable Integer id) {
        return messageService.getMessageById(id)
                .map(messageMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDto> updateMessage(@PathVariable Integer id, @RequestBody MessageDto messageDto) {
        Optional<Message> existingMessageOpt = messageService.getMessageById(id);

        if (existingMessageOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Message existingMessage = existingMessageOpt.get();
        existingMessage.setMessageNumber(messageDto.getMessageNumber());
        existingMessage.setChatId(messageDto.getChatId());
        existingMessage.setRespId(messageDto.getRespId());
        existingMessage.setActor(messageDto.getActor());
        existingMessage.setMessageText(messageDto.getMessageText());
        existingMessage.setDateModified(LocalDateTime.now());

        Message updatedMessage = messageService.saveMessage(existingMessage);
        MessageDto updatedDto = messageMapper.toDto(updatedMessage);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MessageDto> patchMessage(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Message> existingMessageOpt = messageService.getMessageById(id);

        if (existingMessageOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Message existingMessage = existingMessageOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "messageNumber" -> existingMessage.setMessageNumber((Integer) value);
                case "respId" -> existingMessage.setRespId((Integer) value);
                case "actor" -> existingMessage.setActor(Actor.valueOf((String) value ));
                case "messageText" -> existingMessage.setMessageText((String) value);
            }
        });
        existingMessage.setDateModified(LocalDateTime.now());

        Message updatedMessage = messageService.saveMessage(existingMessage);
        MessageDto updatedDto = messageMapper.toDto(updatedMessage);
        return ResponseEntity.ok(updatedDto);
    }

    @GetMapping("/chat/{chatId}")
    public List<Message> getMessagesForChat(@PathVariable Integer chatId) {
        return messageRepo.findByChatId(chatId);
    }

}
