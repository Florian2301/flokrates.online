package flokrates.online.controller;

import flokrates.online.mapper.ChatMapper;
import flokrates.online.model.Chat;
import flokrates.online.model.Language;
import flokrates.online.model.Status;
import flokrates.online.model.dto.ChatDto;
import flokrates.online.service.ChatService;
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
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;
    private final ChatMapper chatMapper;

    @PostMapping("addChat")
    public String addChat(@RequestBody Chat chat) {
        chatService.saveChat(chat);
        return "New Chat " + chat.getChatId() + " is added";
    }

    @GetMapping("getAllChats")
    public List<Chat> getAllChats() {
        return chatService.getAllChats();
    }

    @DeleteMapping("deleteChat/{id}")
    public String deleteChat(@PathVariable("id") Integer id) {
        chatService.deleteChat(id);
        return "Chat " + id + " deleted";
    }

    @GetMapping("getChatById/{id}")
    public ResponseEntity<ChatDto> getChatById(@PathVariable Integer id) {

        /*
        Optional<Chat> chatOpt = chatService.getChatById(id);
        chatOpt.ifPresent(chat -> System.out.println("Chat aus DB: " + chat.getTitle()));

        Chat chat = chatOpt.get();
        ChatDto dto = new ChatDto();
        dto.setChatId(chat.getChatId());
        dto.setChatNumber(chat.getChatNumber());
        dto.setTitle(chat.getTitle());
        dto.setTags(chat.getTags());
        dto.setDescription(chat.getDescription());
        dto.setLanguage(chat.getLanguage());
        dto.setPublished(chat.isPublished());
        dto.setDatePublished(chat.getDatePublished());
        dto.setDateCreated(chat.getDateCreated());
        dto.setDateModified(chat.getDateModified());

         */

        return chatService.getChatById(id)
                .map(chatMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/updateChat/{id}")
    public ResponseEntity<ChatDto> updateChat(@PathVariable Integer id, @RequestBody ChatDto chatDto) {
        Optional<Chat> existingChatOpt = chatService.getChatById(id);

        if (existingChatOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Chat existingChat = existingChatOpt.get();
        existingChat.setChatNumber(chatDto.getChatNumber());
        existingChat.setTitle(chatDto.getTitle());
        existingChat.setTags(chatDto.getTags());
        existingChat.setDescription(chatDto.getDescription());
        existingChat.setLanguage(chatDto.getLanguage());
        existingChat.setStatus(chatDto.getStatus());
        existingChat.setDatePublished(chatDto.getDatePublished());
        existingChat.setDateModified(LocalDateTime.now());

        Chat updatedChat = chatService.saveChat(existingChat);  // Speichere das aktualisierte Objekt
        ChatDto updatedDto = chatMapper.toDto(updatedChat);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/patchChat/{id}")
    public ResponseEntity<ChatDto> patchChat(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Chat> existingChatOpt = chatService.getChatById(id);

        if (existingChatOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Chat existingChat = existingChatOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "chatNumber" -> existingChat.setChatNumber((Integer) value);
                case "title" -> existingChat.setTitle((String) value);
                case "tags" -> existingChat.setTags((String) value);
                case "description" -> existingChat.setDescription((String) value);
                case "language" -> existingChat.setLanguage(Language.valueOf((String) value));
                case "status" -> existingChat.setStatus(Status.valueOf((String) value));
                case "datePublished" -> existingChat.setDatePublished(LocalDateTime.parse((String) value));
            }
        });
        existingChat.setDateModified(LocalDateTime.now());

        Chat updatedChat = chatService.saveChat(existingChat);
        ChatDto updatedDto = chatMapper.toDto(updatedChat);
        return ResponseEntity.ok(updatedDto);
    }
}

/*
-----------------------------
Angenommen du hast in deinem React-Formular ein Eingabefeld für den title, z.B.:

const [title, setTitle] = useState("");

// onChange des Feldes
<input value={title} onChange={e => setTitle(e.target.value)} />

----------------------
Und dein Button ruft dann z.B. folgendes auf:

const patchChat = async () => {
  const response = await fetch(`http://localhost:8080/chat/patchChat/2`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,  // Oder { title } – wenn Key und Value gleich heißen
    }),
  });

  if (response.ok) {
    const updatedChat = await response.json();
    console.log("Erfolgreich gepatcht:", updatedChat);
  } else {
    console.error("Fehler beim Patch:", response.status);
  }
};

---------------------------

Falls du axios verwendest:

import axios from "axios";

const patchChat = async () => {
  try {
    const response = await axios.patch("http://localhost:8080/chat/patchChat/2", {
      title: title,
    });

    console.log("Erfolgreich gepatcht:", response.data);
  } catch (error) {
    console.error("Fehler beim Patch:", error);
  }
};


----------------
Du kannst auch mehrere Felder auf einmal schicken:
{
  "title": "Neuer Titel",
  "description": "Kurze Beschreibung",
  "published": true
}

Das entspricht im Backend:

Map<String, Object> updates = {
  "title" -> "Neuer Titel",
  "description" -> "Kurze Beschreibung",
  "published" -> true
}

------------------------
 Zusammenfassung

    Verwende PATCH-Request mit einem JSON-Body, der ein Key-Value-Objekt ist.

    Das entspricht exakt der Map<String, Object> in Java.

    In React kannst du fetch oder axios nutzen, beides funktioniert gut.

    Die Keys im JSON-Body müssen exakt mit den case-Bezeichnungen im Switch-Block
    deines Controllers übereinstimmen ("title", "published", etc.).


 */
