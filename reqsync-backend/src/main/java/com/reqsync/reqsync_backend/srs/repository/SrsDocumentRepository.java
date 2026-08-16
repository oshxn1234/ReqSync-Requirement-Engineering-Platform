package com.reqsync.reqsync_backend.srs.repository;

import com.reqsync.reqsync_backend.srs.entity.SrsDocument;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SrsDocumentRepository
        extends JpaRepository<SrsDocument, Long> {

    /**
     * Latest (highest version) SRS document for a project.
     */
    Optional<SrsDocument>
    findTopByProjectIdOrderByVersionDesc(
            Long projectId
    );

    /**
     * All SRS document versions for a project,
     * newest first.
     */
    List<SrsDocument>
    findByProjectIdOrderByVersionDesc(
            Long projectId
    );

    boolean existsByProjectId(
            Long projectId
    );
}
