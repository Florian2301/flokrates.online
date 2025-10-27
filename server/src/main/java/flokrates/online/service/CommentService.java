package flokrates.online.service;

import flokrates.online.model.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentService {
    Comment saveComment(Comment comment);
    List<Comment> getAllComments();
    void deleteComment(Integer id);
    Optional<Comment> getCommentById(Integer id);
}
