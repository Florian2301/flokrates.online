package flokrates.online.controller;

import flokrates.online.mapper.CommentMapper;
import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import flokrates.online.service.CommentService;
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
@RequiredArgsConstructor
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:8081")
public class CommentController {
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @PostMapping
    public String addComment(@RequestBody Comment comment) {
        commentService.saveComment(comment);
        return "New Comment " + comment.getCommentId() + " is added";
    }

    @GetMapping
    public List<Comment> getAllComments() {
        return commentService.getAllComments();
    }

    @DeleteMapping("/{id}")
    public String deleteComment(@PathVariable("id") Integer id) {
        commentService.deleteComment(id);
        return "Comment " + id + " deleted";
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Integer id) {
        return commentService.getCommentById(id)
                .map(commentMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Integer id, @RequestBody CommentDto commentDto) {
        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);

        if (existingCommentOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Comment existingComment = existingCommentOpt.get();
        existingComment.setChatId(commentDto.getChatId());
        existingComment.setSender(commentDto.getSender());
        existingComment.setCommentText(commentDto.getCommentText());
        existingComment.setDateModified(LocalDateTime.now());

        Comment updatedComment = commentService.saveComment(existingComment);
        CommentDto updatedDto = commentMapper.toDto(updatedComment);
        return ResponseEntity.ok(updatedDto);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CommentDto> patchComment(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Optional<Comment> existingCommentOpt = commentService.getCommentById(id);

        if (existingCommentOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Comment existingComment = existingCommentOpt.get();
        updates.forEach((key, value) -> {
            switch (key) {
                case "chatId" -> existingComment.setChatId((Integer) value);
                case "sender" -> existingComment.setSender((String) value);
                case "commentText" -> existingComment.setCommentText((String) value);
            }
        });
        existingComment.setDateModified(LocalDateTime.now());

        Comment updatedComment = commentService.saveComment(existingComment);
        CommentDto updatedDto = commentMapper.toDto(updatedComment);
        return ResponseEntity.ok(updatedDto);
    }
}
