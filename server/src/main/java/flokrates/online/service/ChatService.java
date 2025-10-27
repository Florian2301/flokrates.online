package flokrates.online.service;

import flokrates.online.model.Chat;

import java.util.List;
import java.util.Optional;

public interface ChatService {
    Chat saveChat(Chat chat);
    List<Chat> getAllChats();
    void deleteChat(Integer id);
    Optional<Chat> getChatById(Integer id);
}
