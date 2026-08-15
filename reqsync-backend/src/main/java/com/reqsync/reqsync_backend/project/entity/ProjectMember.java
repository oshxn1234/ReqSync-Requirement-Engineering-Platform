package com.reqsync.reqsync_backend.project.entity;

import com.reqsync.reqsync_backend.auth.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "project_members",

        uniqueConstraints = {

                @UniqueConstraint(
                        name = "uk_project_member",
                        columnNames = {
                                "project_id",
                                "user_id"
                        }
                )
        },

        indexes = {

                @Index(
                        name = "idx_project_member_project",
                        columnList = "project_id"
                ),

                @Index(
                        name = "idx_project_member_user",
                        columnList = "user_id"
                )
        }
)
public class ProjectMember {

    // ==========================================
    // Primary Key
    // ==========================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Project
    // ==========================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "project_id",
            nullable = false
    )
    private Project project;


    // ==========================================
    // User
    // ==========================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    // ==========================================
    // Membership Status
    // ==========================================

    @Column(
            nullable = false
    )
    private boolean active = true;


    // ==========================================
    // Assigned Date
    // ==========================================

    @Column(
            nullable = false
    )
    private LocalDateTime assignedAt;


    // ==========================================
    // Removed Date
    // ==========================================

    private LocalDateTime removedAt;


    // ==========================================
    // JPA Lifecycle
    // ==========================================

    @PrePersist
    protected void onCreate() {

        assignedAt =
                LocalDateTime.now();

        active = true;
    }


    // ==========================================
    // Constructors
    // ==========================================

    public ProjectMember() {
    }


    public ProjectMember(
            Project project,
            User user
    ) {

        this.project =
                project;

        this.user =
                user;

        this.active =
                true;
    }


    // ==========================================
    // Getters / Setters
    // ==========================================

    public Long getId() {
        return id;
    }


    public void setId(
            Long id
    ) {
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


    public User getUser() {
        return user;
    }


    public void setUser(
            User user
    ) {
        this.user = user;
    }


    public boolean isActive() {
        return active;
    }


    public void setActive(
            boolean active
    ) {
        this.active = active;
    }


    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }


    public void setAssignedAt(
            LocalDateTime assignedAt
    ) {
        this.assignedAt =
                assignedAt;
    }


    public LocalDateTime getRemovedAt() {
        return removedAt;
    }


    public void setRemovedAt(
            LocalDateTime removedAt
    ) {
        this.removedAt =
                removedAt;
    }
}