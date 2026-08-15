package com.reqsync.reqsync_backend.business.repository;

import com.reqsync.reqsync_backend.business.entity.Business;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessRepository
        extends JpaRepository<Business, Long> {

    boolean existsByRegistrationNumberIgnoreCase(
            String registrationNumber
    );


    Optional<Business>
    findByRegistrationNumberIgnoreCase(
            String registrationNumber
    );
}