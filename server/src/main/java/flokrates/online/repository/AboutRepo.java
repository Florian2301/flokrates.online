package flokrates.online.repository;

import flokrates.online.model.About;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AboutRepo extends JpaRepository<About, Integer> {
    List<About> findBySectionKey(String sectionKey);

}
