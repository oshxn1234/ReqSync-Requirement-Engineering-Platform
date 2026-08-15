package com.reqsync.reqsync_backend.user.entity;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.user.enums.AvailabilityStatus;
import com.reqsync.reqsync_backend.user.enums.ExperienceLevel;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "employee_profiles",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_employee_profile_user",
                        columnNames = "user_id"
                )
        }
)
public class EmployeeProfile {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @OneToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;


    @Column(
            nullable = false
    )
    private Integer yearsOfExperience;


    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private ExperienceLevel experienceLevel;


    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private AvailabilityStatus availabilityStatus;


    /**
     * Percentage from 0 to 100.
     *
     * 0   = no workload
     * 100 = fully occupied
     */
    @Column(
            nullable = false
    )
    private Integer currentWorkloadPercentage;


    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;


    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;


    public EmployeeProfile() {
    }


    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }


    public void setYearsOfExperience(
            Integer yearsOfExperience
    ) {
        this.yearsOfExperience =
                yearsOfExperience;
    }


    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }


    public void setExperienceLevel(
            ExperienceLevel experienceLevel
    ) {
        this.experienceLevel =
                experienceLevel;
    }


    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }


    public void setAvailabilityStatus(
            AvailabilityStatus availabilityStatus
    ) {
        this.availabilityStatus =
                availabilityStatus;
    }


    public Integer getCurrentWorkloadPercentage() {
        return currentWorkloadPercentage;
    }


    public void setCurrentWorkloadPercentage(
            Integer currentWorkloadPercentage
    ) {
        this.currentWorkloadPercentage =
                currentWorkloadPercentage;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}