package com.reqsync.reqsync_backend.knowledge.entity;

import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "knowledge_items",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_knowledge_code",
                        columnNames = "code"
                )
        },

        indexes = {
                @Index(
                        name = "idx_knowledge_project",
                        columnList = "project_id"
                ),

                @Index(
                        name = "idx_knowledge_category",
                        columnList = "category"
                )
        }
)
public class KnowledgeItem {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Code (e.g. K-01, K-02)
    // ==========================================

    @Column(
            nullable = false,
            length = 20
    )
    private String code;


    // ==========================================
    // Optional project association
    // ==========================================

    @Column(
            name = "project_id"
    )
    private Long projectId;


    // ==========================================
    // Project / source name shown in the vault
    // ==========================================

    @Column(
            name = "project_name",
            nullable = false,
            length = 255
    )
    private String projectName;


    // ==========================================
    // Title
    // ==========================================

    @Column(
            nullable = false,
            length = 255
    )
    private String title;


    // ==========================================
    // Category
    // ==========================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 40
    )
    private KnowledgeCategory category;


    // ==========================================
    // Vault date
    // ==========================================

    @Column(
            nullable = false
    )
    private LocalDate date;


    // ==========================================
    // Timestamps
    // ==========================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    // ==========================================
    // Lifecycle
    // ==========================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;

        updatedAt = now;

        if (date == null) {
            date = now.toLocalDate();
        }

        if (category == null) {
            category =
                    KnowledgeCategory.REQUIREMENTS;
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    // ==========================================
    // Constructor
    // ==========================================

    public KnowledgeItem() {
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


    public String getCode() {
        return code;
    }

    public void setCode(
            String code
    ) {
        this.code = code;
    }


    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(
            String projectName
    ) {
        this.projectName = projectName;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public KnowledgeCategory getCategory() {
        return category;
    }

    public void setCategory(
            KnowledgeCategory category
    ) {
        this.category = category;
    }


    public LocalDate getDate() {
        return date;
    }

    public void setDate(
            LocalDate date
    ) {
        this.date = date;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }
}
