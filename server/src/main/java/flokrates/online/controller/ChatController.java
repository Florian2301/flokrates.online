package flokrates.online.controller;

import flokrates.online.mapper.ChatMapper;
import flokrates.online.model.Chat;
import flokrates.online.model.Language;
import flokrates.online.model.Network;
import flokrates.online.model.Status;
import flokrates.online.model.dto.ChatDto;
import flokrates.online.service.ChatService;
import flokrates.online.service.NetworkService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chats")
@CrossOrigin(origins = "http://localhost:8081")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;
    private final ChatMapper chatMapper;

    @PostMapping
    public ResponseEntity<ChatDto> createChat(@RequestBody ChatDto dto) {
        Chat entity = chatMapper.toEntity(dto);
        // (optional) Timestamps auch hier setzen; der Service setzt sie ebenfalls sicherheitshalber
        if (entity.getDateCreated() == null) entity.setDateCreated(LocalDateTime.now());
        entity.setDateModified(LocalDateTime.now());

        Chat created = chatService.saveChat(entity);
        ChatDto body = chatMapper.toDto(created);
        return ResponseEntity
                .created(URI.create("/api/chats/" + created.getChatId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> getAllChats() {
        List<ChatDto> list = chatService.getAllChats().stream()
                .map(chatMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatDto> getChatById(@PathVariable Integer id) {

        return chatService.getChatById(id)
                .map(chatMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
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

        Chat updatedChat = chatService.saveChat(existingChat);
        ChatDto updatedDto = chatMapper.toDto(updatedChat);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ChatDto> patchChat(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Chat> existingChatOpt = chatService.getChatById(id);

        if (existingChatOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Chat existingChat = existingChatOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "chatNumber" -> existingChat.setChatNumber(value != null ? (Integer) value : null);
                case "title" -> existingChat.setTitle((String) value);
                case "tags" -> existingChat.setTags((String) value);
                case "description" -> existingChat.setDescription((String) value);
                case "language" -> existingChat.setLanguage(Language.valueOf((String) value));
                case "status" -> existingChat.setStatus(Status.valueOf((String) value));
                case "datePublished" -> {
                    if (value != null && !value.toString().isBlank()) {
                        existingChat.setDatePublished(LocalDateTime.parse(value.toString()));
                    } else {
                        existingChat.setDatePublished(null);
                    }
                }
            }
        });
        existingChat.setDateModified(LocalDateTime.now());

        Chat updatedChat = chatService.saveChat(existingChat);
        ChatDto updatedDto = chatMapper.toDto(updatedChat);
        return ResponseEntity.ok(updatedDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Integer id) {
        boolean deleted = chatService.deleteChat(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/references")
    public ResponseEntity<List<ChatDto>> getChatReferences(@PathVariable Integer id) {
        List<ChatDto> refs = chatService.getReferencedChats(id).stream()
                .map(chatMapper::toDto)
                .toList();
        return ResponseEntity.ok(refs);
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
