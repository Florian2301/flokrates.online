package flokrates.online.service;

import flokrates.online.model.Comment;
import flokrates.online.model.dto.CommentDto;
import flokrates.online.repository.CommentRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepo commentRepo;

    public Comment saveComment(Comment comment) {
        if (comment.getCommentId() == null) {
            comment.setAdmin(isCurrentUserAdmin());
        }
        return commentRepo.save(comment);
    }

    public List<Comment> getAllComments() {
        return commentRepo.findAll();
    }

    public Optional<Comment> getCommentById(Integer id) {
        return commentRepo.findById(id);
    }

    public List<Comment> getCommentsByChat(Integer chatId) {
        return commentRepo.findByChatId(chatId);
    }

    public Page<Comment> getCommentsByChat(Integer chatId, Pageable pageable) {
        return commentRepo.findByChatId(chatId, pageable);
    }

    public Optional<Comment> updateComment(Integer id, CommentDto dto) {
        return commentRepo.findById(id).map(existing -> {
            existing.setChatId(dto.getChatId());
            existing.setSender(dto.getSender());
            existing.setCommentText(dto.getCommentText());
            return commentRepo.save(existing);
        });
    }

    public Optional<Comment> patchComment(Integer id, Map<String, Object> updates) {
        return commentRepo.findById(id).map(existing -> {
            updates.forEach((k, v) -> {
                switch (k) {
                    case "chatId" -> {
                        if (v != null) {
                            existing.setChatId(((Number) v).intValue());
                        }
                    }
                    case "sender" -> existing.setSender((String) v);
                    case "commentText" -> existing.setCommentText((String) v);
                    default -> {
                    }
                }
            });
            return commentRepo.save(existing);
        });
    }

    public boolean deleteComment(Integer id) {
        if (!commentRepo.existsById(id)) return false;
        commentRepo.deleteById(id);
        return true;
    }

    public void deleteByChat(Integer chatId) {
        commentRepo.deleteByChatId(chatId);
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return false;
        }

        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

}
