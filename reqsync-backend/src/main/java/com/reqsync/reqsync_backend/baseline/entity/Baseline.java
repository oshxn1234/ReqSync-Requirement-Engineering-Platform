package com.reqsync.reqsync_backend.baseline.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "baselines",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_project_baseline_version",
                        columnNames = {
                                "project_id",
                                "version"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_baseline_project",
                        columnList = "project_id"
                )
        }
)
public class Baseline {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            name = "project_id",
            nullable = false
    )
    private Long projectId;


    @Column(
            nullable = false,
            length = 30
    )
    private String version;


    @Column(
            nullable = false,
            length = 500
    )
    private String description;


    @Column(
            name = "created_by",
            nullable = false,
            length = 100
    )
    private String createdBy;


    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDate createdAt;


    @Column(
            name = "req_count",
            nullable = false
    )
    private int reqCount;


    /**
     * Active | Superseded
     */
    @Column(
            nullable = false,
            length = 20
    )
    private String status;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        updatedAt = now;

        if (createdAt == null) {
            createdAt = now.toLocalDate();
        }
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Baseline() {
    }


    public Baseline(
            Long projectId,
            String version,
            String description,
            String createdBy,
            LocalDate createdAt,
            int reqCount,
            String status
    ) {

        this.projectId = projectId;
        this.version = version;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.reqCount = reqCount;
        this.status = status;
    }


    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public String getVersion() {
        return version;
    }

    public void setVersion(
            String version
    ) {
        this.version = version;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }


    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(
            String createdBy
    ) {
        this.createdBy = createdBy;
    }


    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDate createdAt
    ) {
        this.createdAt = createdAt;
    }


    public int getReqCount() {
        return reqCount;
    }

    public void setReqCount(
            int reqCount
    ) {
        this.reqCount = reqCount;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status
    ) {
        this.status = status;
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
