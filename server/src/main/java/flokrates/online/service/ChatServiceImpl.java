package flokrates.online.service;

import flokrates.online.model.Chat;
import flokrates.online.repository.ChatRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatServiceImpl implements ChatService {
    @Autowired
    private ChatRepo chatRepo;

    @Override
    public Chat saveChat(Chat chat) {
        return chatRepo.save(chat);
    }

    @Override
    public List<Chat> getAllChats() {
        return chatRepo.findAll();
    }

    @Override
    public void deleteChat(Integer id) {
        chatRepo.delete(chatRepo.getReferenceById(id));
    }

    @Override
    public Optional<Chat> getChatById(Integer id) {
        return chatRepo.findById(id);
    }
}
