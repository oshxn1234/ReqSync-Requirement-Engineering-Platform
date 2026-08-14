package com.reqsync.reqsync_backend.uml.repository;

import com.reqsync.reqsync_backend.uml.entity.ClassDiagram;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassDiagramRepository
        extends JpaRepository<ClassDiagram, Long> {

    List<ClassDiagram>
    findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    Optional<ClassDiagram>
    findTopByProjectIdOrderByUpdatedAtDesc(Long projectId);
}