package com.reqsync.reqsync_backend.team.entity;

import com.reqsync.reqsync_backend.project.entity.Project;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "project_required_skills",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_project_required_skill",
                        columnNames = {
                                "project_id",
                                "skill_name"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_project_required_skill_project",
                        columnList = "project_id"
                )
        }
)
public class ProjectRequiredSkill {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "project_id",
            nullable = false
    )
    private Project project;


    @Column(
            name = "skill_name",
            nullable = false,
            length = 150
    )
    private String skillName;


    /**
     * Importance from 1 - 5.
     *
     * 1 = low importance
     * 5 = critical
     */
    @Column(nullable = false)
    private Integer importance;


    /**
     * Why Gemini determined this
     * skill is relevant.
     */
    @Column(
            columnDefinition = "TEXT"
    )
    private String reason;


    @Column(nullable = false)
    private LocalDateTime createdAt;


    @PrePersist
    protected void onCreate() {

        createdAt =
                LocalDateTime.now();

        if (importance == null) {
            importance = 3;
        }
    }


    public ProjectRequiredSkill() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public Project getProject() {
        return project;
    }


    public void setProject(
            Project project
    ) {
        this.project = project;
    }


    public String getSkillName() {
        return skillName;
    }


    public void setSkillName(
            String skillName
    ) {
        this.skillName = skillName;
    }


    public Integer getImportance() {
        return importance;
    }


    public void setImportance(
            Integer importance
    ) {
        this.importance = importance;
    }


    public String getReason() {
        return reason;
    }


    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}