package flokrates.online.service;

import flokrates.online.model.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentService {
    public Comment saveComment(Comment comment);

    public List<Comment> getAllComments();

    public void deleteComment(Integer id);

    public Optional<Comment> getCommentById(Integer id);
}
