package flokrates.online.service;

import flokrates.online.model.About;
import flokrates.online.repository.AboutRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AboutService {
    @Autowired
    private AboutRepo aboutRepo;

    /**
     * Erstellt oder aktualisiert einen About-Eintrag.
     */
    public About save(About about) {
//        LocalDateTime now = LocalDateTime.now();
//        if (about.getDateCreated() == null) {
//            about.setDateCreated(now);
//        }
//        about.setDateModified(now);
        return aboutRepo.save(about);
    }

    /**
     * Gibt alle About-Einträge zurück.
     */
    public List<About> findAll() {
        return aboutRepo.findAll();
    }

    /**
     * Sucht einen About-Eintrag nach ID.
     */
    public Optional<About> findById(Integer id) {
        return aboutRepo.findById(id);
    }

    public List<About> findBySection(String sectionKey) {
        return aboutRepo.findBySectionKey(sectionKey);
    }

    /**
     * Löscht einen About-Eintrag, falls vorhanden.
     * @return true, wenn gelöscht; false, wenn ID nicht existiert
     */
    public boolean delete(Integer id) {
        if (!aboutRepo.existsById(id)) {
            return false;
        }
        aboutRepo.deleteById(id);
        return true;
    }
}
