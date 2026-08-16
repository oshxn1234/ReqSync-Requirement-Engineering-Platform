package com.reqsync.reqsync_backend.knowledge.repository;

import com.reqsync.reqsync_backend.knowledge.entity.KnowledgeItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeItemRepository
        extends JpaRepository<KnowledgeItem, Long> {

    /**
     * Return every vault item.
     */
    List<KnowledgeItem>
    findAllByOrderByIdAsc();

    /**
     * Whether a vault item already references a
     * specific document (e.g. an SRS document).
     *
     * Used to avoid publishing duplicate entries
     * when a project is marked as completed.
     */
    boolean existsByReferenceTypeAndReferenceId(
            String referenceType,
            Long referenceId
    );
}
