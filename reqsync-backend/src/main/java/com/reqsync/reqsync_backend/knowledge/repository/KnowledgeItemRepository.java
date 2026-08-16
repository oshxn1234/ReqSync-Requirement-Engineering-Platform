package com.reqsync.reqsync_backend.knowledge.repository;

import com.reqsync.reqsync_backend.knowledge.entity.KnowledgeItem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeItemRepository
        extends JpaRepository<KnowledgeItem, Long> {

    /**
     * Return shared vault items plus the items
     * linked to the requested project.
     */
    List<KnowledgeItem>
    findByProjectIdIsNullOrProjectIdOrderByIdAsc(
            Long projectId
    );


    /**
     * Return every vault item.
     */
    List<KnowledgeItem>
    findAllByOrderByIdAsc();
}
