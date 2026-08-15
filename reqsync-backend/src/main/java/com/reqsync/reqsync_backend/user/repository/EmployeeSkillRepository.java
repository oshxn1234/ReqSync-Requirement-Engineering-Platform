package com.reqsync.reqsync_backend.user.repository;

import com.reqsync.reqsync_backend.user.entity.EmployeeSkill;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeSkillRepository
        extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill>
    findByEmployeeProfileId(
            Long employeeProfileId
    );


    void deleteByEmployeeProfileId(
            Long employeeProfileId
    );
}