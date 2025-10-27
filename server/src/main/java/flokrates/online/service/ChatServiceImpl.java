package flokrates.online.service;

import flokrates.online.model.Chat;
import flokrates.online.repository.ChatRepo;
import flokrates.online.repository.MessageRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {
    @Autowired
    private final ChatRepo chatRepo;
    @Autowired
    private final MessageRepo messageRepo;
    public ChatServiceImpl(ChatRepo chatRepo, MessageRepo messageRepo) {
        this.chatRepo = chatRepo;
        this.messageRepo = messageRepo;
    }
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
        messageRepo.deleteByChatId(id);
        chatRepo.delete(chatRepo.getReferenceById(id));
    }
    @Override
    public Optional<Chat> getChatById(Integer id) {
        return chatRepo.findById(id);
    }
}
