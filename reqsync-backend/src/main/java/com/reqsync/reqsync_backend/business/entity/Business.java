package com.reqsync.reqsync_backend.business.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "businesses",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_business_registration_number",
                        columnNames = "registration_number"
                )
        }
)
public class Business {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            nullable = false,
            length = 200
    )
    private String name;


    @Column(
            name = "registration_number",
            nullable = false,
            unique = true,
            length = 100
    )
    private String registrationNumber;


    @Column(
            length = 150
    )
    private String email;


    @Column(
            length = 50
    )
    private String phone;


    @Column(
            columnDefinition = "TEXT"
    )
    private String address;


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

    public Business() {
    }


    public Business(
            String name,
            String registrationNumber,
            String email,
            String phone,
            String address
    ) {

        this.name = name;
        this.registrationNumber =
                registrationNumber;

        this.email = email;
        this.phone = phone;
        this.address = address;
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


    public String getName() {
        return name;
    }


    public void setName(
            String name
    ) {
        this.name = name;
    }


    public String getRegistrationNumber() {
        return registrationNumber;
    }


    public void setRegistrationNumber(
            String registrationNumber
    ) {
        this.registrationNumber =
                registrationNumber;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public String getPhone() {
        return phone;
    }


    public void setPhone(
            String phone
    ) {
        this.phone = phone;
    }


    public String getAddress() {
        return address;
    }


    public void setAddress(
            String address
    ) {
        this.address = address;
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