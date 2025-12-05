package flokrates.online.service;

import flokrates.online.model.About;
import flokrates.online.repository.AboutRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AboutService {
    @Autowired
    private AboutRepo aboutRepo;

    public About save(About about) {
        return aboutRepo.save(about);
    }

    public List<About> findAll() {
        return aboutRepo.findAll();
    }

    public Optional<About> findById(Integer id) {
        return aboutRepo.findById(id);
    }

    public List<About> findBySection(String sectionKey) {
        return aboutRepo.findBySectionKey(sectionKey);
    }

    public boolean delete(Integer id) {
        if (!aboutRepo.existsById(id)) {
            return false;
        }
        aboutRepo.deleteById(id);
        return true;
    }
}
