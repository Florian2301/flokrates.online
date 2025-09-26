package flokrates.online.service;

import flokrates.online.model.Message;

import java.util.List;
import java.util.Optional;

public interface MessageService {
    Message saveMessage(Message message);

    List<Message> getAllMessages();

    void deleteMessage(Integer id);

    Optional<Message> getMessageById(Integer id);
}
