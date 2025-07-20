package flokrates.online.service;

import flokrates.online.model.Chat;

import java.util.List;
import java.util.Optional;

public interface ChatService {
    public Chat saveChat(Chat chat);

    public List<Chat> getAllChats();

    public void deleteChat(Integer id);

    public Optional<Chat> getChatById(Integer id);
}
