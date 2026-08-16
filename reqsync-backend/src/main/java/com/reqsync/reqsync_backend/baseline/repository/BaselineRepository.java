package com.reqsync.reqsync_backend.baseline.repository;

import com.reqsync.reqsync_backend.baseline.entity.Baseline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaselineRepository
        extends JpaRepository<Baseline, Long> {

    List<Baseline> findByProjectIdOrderByIdAsc(
            Long projectId
    );


    Optional<Baseline> findByProjectIdAndVersion(
            Long projectId,
            String version
    );
}
