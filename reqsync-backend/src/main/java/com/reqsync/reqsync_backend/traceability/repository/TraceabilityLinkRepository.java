package com.reqsync.reqsync_backend.traceability.repository;

import com.reqsync.reqsync_backend.traceability.entity.TraceabilityArtifactType;
import com.reqsync.reqsync_backend.traceability.entity.TraceabilityLink;
import com.reqsync.reqsync_backend.traceability.entity.TraceabilityRelationType;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TraceabilityLinkRepository
        extends JpaRepository<TraceabilityLink, Long> {


    List<TraceabilityLink>
    findByRequirementIdOrderByCreatedAtAsc(
            Long requirementId
    );


    List<TraceabilityLink>
    findByProjectIdOrderByRequirementIdAscCreatedAtAsc(
            Long projectId
    );


    Optional<TraceabilityLink>
    findByRequirementIdAndArtifactTypeAndArtifactIdAndArtifactVersionAndRelationType(
            Long requirementId,
            TraceabilityArtifactType artifactType,
            Long artifactId,
            Integer artifactVersion,
            TraceabilityRelationType relationType
    );


    List<TraceabilityLink>
    findByArtifactTypeAndArtifactId(
            TraceabilityArtifactType artifactType,
            Long artifactId
    );


    void deleteByArtifactTypeAndArtifactId(
            TraceabilityArtifactType artifactType,
            Long artifactId
    );


    void deleteByRequirementId(
            Long requirementId
    );
}