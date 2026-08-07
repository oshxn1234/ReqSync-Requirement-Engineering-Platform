package com.reqsync.reqsync_backend.uml.repository;

import com.reqsync.reqsync_backend.uml.entity.ClassDiagramVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassDiagramVersionRepository
        extends JpaRepository<ClassDiagramVersion, Long> {

    List<ClassDiagramVersion>
    findByDiagramIdOrderByVersionNumberDesc(Long diagramId);

    Optional<ClassDiagramVersion>
    findTopByDiagramIdOrderByVersionNumberDesc(Long diagramId);
}