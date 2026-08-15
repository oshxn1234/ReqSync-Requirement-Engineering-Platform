package com.reqsync.reqsync_backend.user.repository;

import com.reqsync.reqsync_backend.user.entity.EmployeeProfile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeProfileRepository
        extends JpaRepository<EmployeeProfile, Long> {

    Optional<EmployeeProfile> findByUserId(
            Long userId
    );
}