package flokrates.online.service;

import flokrates.online.model.Chat;
import flokrates.online.repository.ChatRepo;
import flokrates.online.repository.MessageRepo;
import flokrates.online.repository.NetworkRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatService {
    @Autowired
    private ChatRepo chatRepo;
    @Autowired
    private MessageRepo messageRepo;
    @Autowired
    private NetworkRepo networkRepo;

    public Chat saveChat(Chat chat) {
            var now = LocalDateTime.now();
            if (chat.getDateCreated() == null) chat.setDateCreated(now);
            chat.setDateModified(now);

        return chatRepo.save(chat);
    }
    public List<Chat> getAllChats() {
        return chatRepo.findAll();
    }
    public Optional<Chat> getChatById(Integer id) {
        return chatRepo.findById(id);
    }

    public boolean deleteChat(Integer id) {
        if (!chatRepo.existsById(id)) return false;
        // abhängige Daten entfernen
        //networkRepo.deleteByChatId(id);
        //networkRepo.deleteByRefId(id);
        //messageRepo.deleteByChatId(id);
        chatRepo.deleteById(id);
        return true;
    }
    public List<Chat> getReferencedChats(Integer chatId) {
        var refs = networkRepo.findByChatId(chatId); // hat refId
        var refIds = refs.stream()
                .map(n -> n.getRefId())
                .distinct()
                .toList();
        return refIds.isEmpty() ? List.of() : chatRepo.findAllByChatIdIn(refIds);
    }

    public long getMessageCountForChat(Integer chatId) {
        return messageRepo.countByChatId(chatId);
    }
    public java.util.Map<Integer, Long> getMessageCountsForChats(java.util.Collection<Integer> chatIds) {
        if (chatIds == null || chatIds.isEmpty()) return java.util.Map.of();

        var rows = messageRepo.countByChatIds(chatIds);
        java.util.Map<Integer, Long> map = new java.util.HashMap<>();
        for (var r : rows) map.put(r.getChatId(), r.getCnt());
        for (Integer id : chatIds) map.putIfAbsent(id, 0L);
        return map;
    }
    public java.util.Map<Integer, Long> getMessageCountsForAllChats() {
        var allIds = chatRepo.findAll()
                .stream()
                .map(Chat::getChatId)
                .toList();
        return getMessageCountsForChats(allIds);
    }
}
