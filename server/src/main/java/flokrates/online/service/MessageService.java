package flokrates.online.service;

import flokrates.online.model.Actor;
import flokrates.online.model.Message;
import flokrates.online.model.dto.MessageDto;
import flokrates.online.repository.AttachmentRepo;
import flokrates.online.repository.MessageRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepo messageRepo;
    private final AttachmentRepo attachmentRepo;

    public Message createMessage(Message entity) {

        if (entity.getMessageNumber() == null) {
            int next = messageRepo.findTopByChatIdOrderByMessageNumberDesc(entity.getChatId())
                    .map(m -> m.getMessageNumber() == null ? 0 : m.getMessageNumber())
                    .orElse(0) + 1;
            entity.setMessageNumber(next);
        }

        return messageRepo.save(entity);
    }

    public Optional<Message> getMessageById(Integer id) {
        return messageRepo.findById(id);
    }

    public List<Message> getAllMessages() {
        return messageRepo.findAll();
    }

    public List<Message> getMessagesByChat(Integer chatId) {
        return messageRepo.findByChatIdOrderByMessageNumberAsc(chatId);
    }

    public Page<Message> getMessagesByChat(Integer chatId, Pageable pageable) {
        return messageRepo.findByChatId(chatId, pageable);
    }

    public Optional<Message> updateMessage(Integer id, MessageDto dto) {
        return messageRepo.findById(id).map(existing -> {
            existing.setMessageNumber(dto.getMessageNumber());
            existing.setChatId(dto.getChatId());
            existing.setRespId(dto.getRespId());
            if (dto.getActor() != null) existing.setActor(dto.getActor());
            existing.setMessageText(dto.getMessageText());
            return messageRepo.save(existing);
        });
    }

    public Optional<Message> patchMessage(Integer id, Map<String, Object> updates) {
        return messageRepo.findById(id).map(existing -> {
            updates.forEach((k, v) -> {
                switch (k) {
                    case "messageNumber" -> existing.setMessageNumber((Integer) v);
                    case "chatId" -> existing.setChatId((Integer) v);
                    case "respId" -> existing.setRespId((Integer) v);
                    case "actor" -> existing.setActor(
                            (v instanceof String s) ? Actor.valueOf(s) : (Actor) v
                    );
                    case "messageText" -> existing.setMessageText((String) v);
                    default -> {
                    }
                }
            });
            existing.setDateModified(LocalDateTime.now());
            return messageRepo.save(existing);
        });
    }

    public boolean deleteMessage(Integer id) {
        if (!messageRepo.existsById(id)) return false;
        messageRepo.deleteById(id);
        return true;
    }

    public void deleteMessagesByChatId(Integer chatId) {
        var messageIds = messageRepo.findByChatIdOrderByMessageNumberAsc(chatId)
                .stream().map(Message::getMessageId).toList();
        if (messageIds.isEmpty()) return;

        attachmentRepo.deleteByMessageIdIn(messageIds);
        messageRepo.deleteByChatId(chatId);
    }
}
