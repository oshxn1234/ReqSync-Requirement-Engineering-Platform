package com.reqsync.reqsync_backend.auth.entity;

import com.reqsync.reqsync_backend.business.entity.Business;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",

        uniqueConstraints = {

                @UniqueConstraint(
                        name = "uk_users_email",
                        columnNames = "email"
                )
        },

        indexes = {

                @Index(
                        name = "idx_user_business",
                        columnList = "business_id"
                ),

                @Index(
                        name = "idx_user_role",
                        columnList = "role"
                )
        }
)
public class User {

    // ==========================================
    // Primary Key
    // ==========================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // ==========================================
    // Business
    // ==========================================

    /**
     * Business that this user belongs to.
     *
     * Every CEO, Project Manager,
     * Developer, QA Engineer, etc.
     * belongs to one business.
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
    // Authentication Information
    // ==========================================

    @Column(
            nullable = false,
            unique = true,
            length = 150
    )
    private String email;


    /**
     * BCrypt-encoded password.
     *
     * Never store the raw password here.
     */
    @Column(
            nullable = false,
            length = 255
    )
    private String password;


    // ==========================================
    // Personal Details
    // ==========================================

    @Column(
            nullable = false,
            length = 100
    )
    private String firstName;


    @Column(
            nullable = false,
            length = 100
    )
    private String lastName;


    // ==========================================
    // Role
    // ==========================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private Role role;


    // ==========================================
    // Account Status
    // ==========================================

    @Column(
            nullable = false
    )
    private boolean enabled = true;


    @Column(
            nullable = false
    )
    private boolean accountLocked = false;


    @Column(
            nullable = false
    )
    private int failedLoginAttempts = 0;


    private LocalDateTime lastLoginAt;


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
    // Constructors
    // ==========================================

    public User() {
    }


    public User(
            Business business,
            String email,
            String password,
            String firstName,
            String lastName,
            Role role
    ) {

        this.business =
                business;

        this.email =
                email;

        this.password =
                password;

        this.firstName =
                firstName;

        this.lastName =
                lastName;

        this.role =
                role;

        this.enabled =
                true;

        this.accountLocked =
                false;

        this.failedLoginAttempts =
                0;
    }


    // ==========================================
    // JPA Lifecycle
    // ==========================================

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


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(
            String password
    ) {
        this.password = password;
    }


    public String getFirstName() {
        return firstName;
    }


    public void setFirstName(
            String firstName
    ) {
        this.firstName =
                firstName;
    }


    public String getLastName() {
        return lastName;
    }


    public void setLastName(
            String lastName
    ) {
        this.lastName =
                lastName;
    }


    public Role getRole() {
        return role;
    }


    public void setRole(
            Role role
    ) {
        this.role = role;
    }


    public boolean isEnabled() {
        return enabled;
    }


    public void setEnabled(
            boolean enabled
    ) {
        this.enabled = enabled;
    }


    public boolean isAccountLocked() {
        return accountLocked;
    }


    public void setAccountLocked(
            boolean accountLocked
    ) {
        this.accountLocked =
                accountLocked;
    }


    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }


    public void setFailedLoginAttempts(
            int failedLoginAttempts
    ) {
        this.failedLoginAttempts =
                failedLoginAttempts;
    }


    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }


    public void setLastLoginAt(
            LocalDateTime lastLoginAt
    ) {
        this.lastLoginAt =
                lastLoginAt;
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