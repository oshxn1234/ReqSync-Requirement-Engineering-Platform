package com.reqsync.reqsync_backend.auth.repository;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository
        extends JpaRepository<User, Long> {


    /**
     * Find user by email.
     *
     * Used by JWT authentication.
     */
    Optional<User> findByEmailIgnoreCase(
            String email
    );


    /**
     * Check whether an email already exists.
     */
    boolean existsByEmailIgnoreCase(
            String email
    );


    /**
     * Get all users belonging to one business.
     */
    List<User> findByBusinessId(
            Long businessId
    );


    /**
     * Get users belonging to a business
     * with a particular role.
     *
     * Example:
     *
     * Get all PROJECT_MANAGER users
     * belonging to Business 2.
     */
    List<User> findByBusinessIdAndRole(
            Long businessId,
            Role role
    );


    /**
     * Find one user and verify that the user
     * belongs to the specified business.
     */
    Optional<User> findByIdAndBusinessId(
            Long userId,
            Long businessId
    );
}