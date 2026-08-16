package com.reqsync.reqsync_backend.approval.entity;

import com.reqsync.reqsync_backend.approval.enums.ApprovalStatus;
import com.reqsync.reqsync_backend.approval.enums.ApprovalType;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "approvals",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_approval_code",
                        columnNames = "code"
                )
        },

        indexes = {
                @Index(
                        name = "idx_approval_project",
                        columnList = "project_id"
                ),

                @Index(
                        name = "idx_approval_status",
                        columnList = "status"
                )
        }
)
public class Approval {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Code (e.g. APR-101, APR-102)
    // ==========================================

    @Column(
            nullable = false,
            length = 20
    )
    private String code;


    // ==========================================
    // Project
    // ==========================================

    @Column(
            name = "project_id",
            nullable = false
    )
    private Long projectId;


    // ==========================================
    // Title
    // ==========================================

    @Column(
            nullable = false,
            length = 255
    )
    private String title;


    // ==========================================
    // Type
    // ==========================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private ApprovalType type;


    // ==========================================
    // Requester
    // ==========================================

    @Column(
            name = "requested_by",
            nullable = false,
            length = 100
    )
    private String requestedBy;


    @Column(
            name = "requested_on",
            nullable = false
    )
    private LocalDate requestedOn;


    // ==========================================
    // Lifecycle Status
    // ==========================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private ApprovalStatus status;


    // ==========================================
    // Decision Audit
    // ==========================================

    @Column(
            name = "decided_by",
            length = 100
    )
    private String decidedBy;


    @Column(
            name = "decided_on"
    )
    private LocalDate decidedOn;


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

        if (requestedOn == null) {
            requestedOn = now.toLocalDate();
        }

        if (status == null) {
            status = ApprovalStatus.PENDING;
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

    public Approval() {
    }


    public Approval(
            Long projectId,
            String title,
            ApprovalType type,
            String requestedBy,
            LocalDate requestedOn
    ) {

        this.projectId = projectId;
        this.title = title;
        this.type = type;
        this.requestedBy = requestedBy;
        this.requestedOn = requestedOn;
        this.status = ApprovalStatus.PENDING;
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


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public ApprovalType getType() {
        return type;
    }

    public void setType(
            ApprovalType type
    ) {
        this.type = type;
    }


    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(
            String requestedBy
    ) {
        this.requestedBy = requestedBy;
    }


    public LocalDate getRequestedOn() {
        return requestedOn;
    }

    public void setRequestedOn(
            LocalDate requestedOn
    ) {
        this.requestedOn = requestedOn;
    }


    public ApprovalStatus getStatus() {
        return status;
    }

    public void setStatus(
            ApprovalStatus status
    ) {
        this.status = status;
    }


    public String getDecidedBy() {
        return decidedBy;
    }

    public void setDecidedBy(
            String decidedBy
    ) {
        this.decidedBy = decidedBy;
    }


    public LocalDate getDecidedOn() {
        return decidedOn;
    }

    public void setDecidedOn(
            LocalDate decidedOn
    ) {
        this.decidedOn = decidedOn;
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
