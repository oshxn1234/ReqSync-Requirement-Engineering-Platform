package com.reqsync.reqsync_backend.team.repository;

import com.reqsync.reqsync_backend.team.entity.ProjectRequiredSkill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRequiredSkillRepository
        extends JpaRepository<ProjectRequiredSkill, Long> {

    List<ProjectRequiredSkill>
    findByProjectId(
            Long projectId
    );


    boolean existsByProjectIdAndSkillNameIgnoreCase(
            Long projectId,
            String skillName
    );


    void deleteByProjectId(
            Long projectId
    );
}