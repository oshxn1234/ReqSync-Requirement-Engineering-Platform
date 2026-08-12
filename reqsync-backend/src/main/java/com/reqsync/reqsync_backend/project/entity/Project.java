package com.reqsync.reqsync_backend.project.entity;

import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "projects",
        indexes = {
                @Index(
                        name = "idx_project_name",
                        columnList = "name"
                ),
                @Index(
                        name = "idx_project_status",
                        columnList = "status"
                )
        }
)
public class Project {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    /**
     * Name of the software project.
     */
    @Column(
            nullable = false,
            length = 255
    )
    private String name;


    /**
     * Project description.
     */
    @Column(
            columnDefinition = "TEXT"
    )
    private String description;


    /**
     * Current project lifecycle status.
     */
    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private ProjectStatus status;


    /**
     * Creation timestamp.
     */
    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;


    /**
     * Last update timestamp.
     */
    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;


    // ---------------------------------------------------------
    // JPA Lifecycle
    // ---------------------------------------------------------

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;

        updatedAt = now;

        if (status == null) {

            status =
                    ProjectStatus.PLANNING;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    // ---------------------------------------------------------
    // Constructors
    // ---------------------------------------------------------

    public Project() {
    }


    public Project(
            String name,
            String description
    ) {

        this.name = name;

        this.description =
                description;

        this.status =
                ProjectStatus.PLANNING;
    }


    // ---------------------------------------------------------
    // Getters and Setters
    // ---------------------------------------------------------

    public Long getId() {

        return id;
    }


    public void setId(
            Long id
    ) {

        this.id = id;
    }


    public String getName() {

        return name;
    }


    public void setName(
            String name
    ) {

        this.name = name;
    }


    public String getDescription() {

        return description;
    }


    public void setDescription(
            String description
    ) {

        this.description =
                description;
    }


    public ProjectStatus getStatus() {

        return status;
    }


    public void setStatus(
            ProjectStatus status
    ) {

        this.status = status;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {

        this.createdAt =
                createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }


    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {

        this.updatedAt =
                updatedAt;
    }
}