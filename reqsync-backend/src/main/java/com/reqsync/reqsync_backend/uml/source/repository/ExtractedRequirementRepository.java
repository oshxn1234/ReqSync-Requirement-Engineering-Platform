package com.reqsync.reqsync_backend.uml.source.repository;

import com.reqsync.reqsync_backend.uml.source.entity.ExtractedRequirement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExtractedRequirementRepository
        extends JpaRepository<ExtractedRequirement, Long> {

    List<ExtractedRequirement>
    findByProjectIdAndStatusOrderByIdAsc(
            Long projectId,
            String status
    );
}