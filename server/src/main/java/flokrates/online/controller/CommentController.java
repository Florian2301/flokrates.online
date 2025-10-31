package flokrates.online.controller;

import flokrates.online.mapper.CommentMapper;
import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import flokrates.online.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:8081")
public class CommentController {
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @PostMapping
    public ResponseEntity<CommentDto> createComment(@RequestBody CommentDto dto) {
        // DTO → Entity
        Comment entity = commentMapper.toEntity(dto);
        if (entity.getDateCreated() == null)
            entity.setDateCreated(LocalDateTime.now());
        entity.setDateModified(LocalDateTime.now());

        // Speichern
        Comment created = commentService.saveComment(entity);

        // Entity → DTO
        CommentDto body = commentMapper.toDto(created);

        return ResponseEntity
                .created(URI.create("/api/comments/" + created.getCommentId()))
                .body(body);
    }

    @GetMapping
    public ResponseEntity<List<CommentDto>> getAllComments() {
        List<CommentDto> list = commentService.getAllComments().stream()
                .map(commentMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Integer id) {
        return commentService.getCommentById(id)
                .map(commentMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-chat/{chatId}")
    public ResponseEntity<List<CommentDto>> getByChat(@PathVariable Integer chatId) {
        return ResponseEntity.ok(
                commentService.getCommentsByChat(chatId).stream()
                        .map(commentMapper::toDto)
                        .toList()
        );
    }

    @GetMapping("/by-chat/{chatId}/paged")
    public ResponseEntity<Page<CommentDto>> getByChatPaged(@PathVariable Integer chatId,
                                                           @PageableDefault(size = 20, sort = "dateCreated") Pageable pageable) {
        Page<CommentDto> page = commentService.getCommentsByChat(chatId, pageable)
                .map(commentMapper::toDto);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Integer id,
                                                    @RequestBody CommentDto dto) {
        return commentService.updateComment(id, dto)
                .map(commentMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CommentDto> patchComment(@PathVariable Integer id,
                                                   @RequestBody Map<String, Object> updates) {
        return commentService.patchComment(id, updates)
                .map(commentMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer id) {
        boolean deleted = commentService.deleteComment(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/by-chat/{chatId}")
    public ResponseEntity<Void> deleteByChat(@PathVariable Integer chatId) {
        commentService.deleteByChat(chatId);
        return ResponseEntity.noContent().build();
    }



//    @PutMapping("/{id}")
//    public ResponseEntity<CommentDto> updateComment(@PathVariable Integer id, @RequestBody CommentDto commentDto) {
//        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);
//
//        if (existingCommentOpt.isEmpty())
//            return ResponseEntity.notFound().build();
//
//        Comment existingComment = existingCommentOpt.get();
//        existingComment.setChatId(commentDto.getChatId());
//        existingComment.setSender(commentDto.getSender());
//        existingComment.setCommentText(commentDto.getCommentText());
//        existingComment.setDateModified(LocalDateTime.now());
//
//        Comment updatedComment = commentService.saveComment(existingComment);
//        CommentDto updatedDto = commentMapper.toDto(updatedComment);
//        return ResponseEntity.ok(updatedDto);
//    }
//
//    @PatchMapping("/{id}")
//    public ResponseEntity<CommentDto> patchComment(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
//        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);
//
//        if (existingCommentOpt.isEmpty())
//            return ResponseEntity.notFound().build();
//
//        Comment existingComment = existingCommentOpt.get();
//        updates.forEach((key, value) -> {
//            switch (key) {
//                case "chatId" -> existingComment.setChatId((Integer) value);
//                case "sender" -> existingComment.setSender((String) value);
//                case "commentText" -> existingComment.setCommentText((String) value);
//            }
//        });
//        existingComment.setDateModified(LocalDateTime.now());
//
//        Comment updatedComment = commentService.saveComment(existingComment);
//        CommentDto updatedDto = commentMapper.toDto(updatedComment);
//        return ResponseEntity.ok(updatedDto);
//    }
}
