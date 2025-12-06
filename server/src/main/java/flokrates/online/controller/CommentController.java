package flokrates.online.controller;

import flokrates.online.mapper.CommentMapper;
import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import flokrates.online.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:8081")
public class CommentController {
    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @PostMapping
    public ResponseEntity<CommentDto> createComment(@RequestBody CommentDto dto) {

        Comment entity = commentMapper.toEntity(dto);
        Comment created = commentService.saveComment(entity);
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
        List<CommentDto> list = commentService.getCommentsByChat(chatId).stream()
                .map(commentMapper::toDto)
                .toList();
        return ResponseEntity.ok(list);
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
}
