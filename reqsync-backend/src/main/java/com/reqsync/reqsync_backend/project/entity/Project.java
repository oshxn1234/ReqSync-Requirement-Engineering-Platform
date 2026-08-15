package com.reqsync.reqsync_backend.project.entity;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.business.entity.Business;
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
                ),

                @Index(
                        name = "idx_project_business",
                        columnList = "business_id"
                ),

                @Index(
                        name = "idx_project_manager",
                        columnList = "project_manager_id"
                )
        },

        uniqueConstraints = {

                /*
                 * Project number must be unique
                 * inside ONE business.
                 *
                 * Example:
                 *
                 * Business 1 -> Project 1
                 * Business 1 -> Project 2
                 *
                 * Business 2 -> Project 1
                 *
                 * This is allowed.
                 */
                @UniqueConstraint(
                        name = "uk_business_project_number",
                        columnNames = {
                                "business_id",
                                "project_number"
                        }
                )
        }
)
public class Project {

    // ==========================================
    // Primary Key
    // ==========================================

    /**
     * Global database ID.
     *
     * This remains the actual primary key.
     */
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Business
    // ==========================================

    /**
     * Business that owns this project.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "business_id",
            nullable = false
    )
    private Business business;


    // ==========================================
    // Business-specific Project Number
    // ==========================================

    /**
     * Sequential project number inside
     * a particular business.
     *
     * Example:
     *
     * Business 1:
     * projectNumber = 1
     * projectNumber = 2
     * projectNumber = 3
     *
     * Business 2:
     * projectNumber = 1
     * projectNumber = 2
     */
    @Column(
            name = "project_number",
            nullable = false
    )
    private Integer projectNumber;


    // ==========================================
    // Project Details
    // ==========================================

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


    // ==========================================
    // Assigned Project Manager
    // ==========================================

    /**
     * Project manager assigned to this project.
     *
     * Initially this may be null.
     *
     * The CEO will assign a PROJECT_MANAGER
     * later.
     */
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "project_manager_id"
    )
    private User projectManager;


    // ==========================================
    // Timestamps
    // ==========================================

    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;


    // ==========================================
    // JPA Lifecycle
    // ==========================================

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


    // ==========================================
    // Constructors
    // ==========================================

    public Project() {
    }


    public Project(
            Business business,
            Integer projectNumber,
            String name,
            String description
    ) {

        this.business =
                business;

        this.projectNumber =
                projectNumber;

        this.name =
                name;

        this.description =
                description;

        this.status =
                ProjectStatus.PLANNING;
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


    public Business getBusiness() {
        return business;
    }


    public void setBusiness(
            Business business
    ) {
        this.business = business;
    }


    public Integer getProjectNumber() {
        return projectNumber;
    }


    public void setProjectNumber(
            Integer projectNumber
    ) {
        this.projectNumber =
                projectNumber;
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


    public User getProjectManager() {
        return projectManager;
    }


    public void setProjectManager(
            User projectManager
    ) {
        this.projectManager =
                projectManager;
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