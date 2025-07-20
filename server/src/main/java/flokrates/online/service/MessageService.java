package flokrates.online.service;

import flokrates.online.model.Message;

import java.util.List;
import java.util.Optional;

public interface MessageService {
    public Message saveMessage(Message message);

    public List<Message> getAllMessages();

    public void deleteMessage(Integer id);

    public Optional<Message> getMessageById(Integer id);
}
