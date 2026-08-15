package com.reqsync.reqsync_backend.userstory.repository;

import com.reqsync.reqsync_backend.userstory.entity.UserStory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStoryRepository
        extends JpaRepository<UserStory, Long> {

    List<UserStory> findByProjectIdOrderByIdAsc(
            Long projectId
    );


    Optional<UserStory>
    findByIdAndProjectId(
            Long id,
            Long projectId
    );


    boolean existsByProjectIdAndSourceRequirementId(
            Long projectId,
            Long sourceRequirementId
    );


    long countByProjectId(
            Long projectId
    );
}