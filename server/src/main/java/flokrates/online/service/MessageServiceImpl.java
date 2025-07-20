package flokrates.online.service;

import flokrates.online.model.Message;
import flokrates.online.repository.MessageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageServiceImpl implements MessageService {
    @Autowired
    private MessageRepo messageRepo;

    @Override
    public Message saveMessage(Message message) {
        return messageRepo.save(message);
    }

    @Override
    public List<Message> getAllMessages() {
        return messageRepo.findAll();
    }

    @Override
    public void deleteMessage(Integer id) {
        messageRepo.delete(messageRepo.getReferenceById(id));
    }

    @Override
    public Optional<Message> getMessageById(Integer id) {
        return messageRepo.findById(id);
    }
}
