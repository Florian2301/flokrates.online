package flokrates.online.service;

import flokrates.online.model.Comment;
import flokrates.online.repository.CommentRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepo commentRepo;
    @Override
    public Comment saveComment(Comment comment) {
        return commentRepo.save(comment);
    }
    @Override
    public List<Comment> getAllComments() {
        return commentRepo.findAll();
    }
    @Override
    public void deleteComment(Integer id) {
        commentRepo.delete(commentRepo.getReferenceById(id));
    }
    @Override
    public Optional<Comment> getCommentById(Integer id) {
        return commentRepo.findById(id);
    }
}
