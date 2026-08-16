package com.reqsync.reqsync_backend.approval.config;

import com.reqsync.reqsync_backend.approval.entity.Approval;
import com.reqsync.reqsync_backend.approval.enums.ApprovalType;
import com.reqsync.reqsync_backend.approval.repository.ApprovalRepository;

import com.reqsync.reqsync_backend.baseline.entity.Baseline;
import com.reqsync.reqsync_backend.baseline.repository.BaselineRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class ApprovalDataInitializer {

    @Bean
    CommandLineRunner initializeApprovals(
            ApprovalRepository approvalRepository,
            BaselineRepository baselineRepository
    ) {

        return args -> {

            seedApprovals(
                    approvalRepository
            );

            seedBaselines(
                    baselineRepository
            );
        };
    }


    private void seedApprovals(
            ApprovalRepository repository
    ) {

        if (
                repository.countByProjectId(1L) > 0
        ) {

            return;
        }


        createApproval(
                repository,
                "APR-105",
                "REQ-128 User Authentication update (2FA option)",
                ApprovalType.REQUIREMENT,
                "Sarah Johnson",
                "2026-06-12"
        );

        createApproval(
                repository,
                "APR-104",
                "Baseline v1.3 Snapshot approval",
                ApprovalType.BASELINE,
                "Michael Brown",
                "2026-06-14"
        );

        createApproval(
                repository,
                "APR-103",
                "Change Request #32 (Increase Transfer Limits)",
                ApprovalType.CHANGE_REQUEST,
                "John Doe",
                "2026-06-14"
        );

        createApproval(
                repository,
                "APR-102",
                "REQ-130 Session Timeout limit setting",
                ApprovalType.REQUIREMENT,
                "Emily Davis",
                "2026-06-15"
        );

        createApproval(
                repository,
                "APR-101",
                "REQ-110 Device Management profile dashboard",
                ApprovalType.REQUIREMENT,
                "Emily Davis",
                "2026-06-15"
        );
    }


    private void seedBaselines(
            BaselineRepository repository
    ) {

        if (
                repository.count() > 0
        ) {

            return;
        }


        createBaseline(
                repository,
                "v1.3",
                "Third Baseline for release 2 - Core features finalized",
                "Michael Brown",
                "2026-06-14",
                88,
                "Active"
        );

        createBaseline(
                repository,
                "v1.2",
                "Updated with security requirements and OTP registration details",
                "Sarah Johnson",
                "2026-06-10",
                82,
                "Superseded"
        );

        createBaseline(
                repository,
                "v1.1",
                "Added fund transfer requirements and edge case rules",
                "John Doe",
                "2026-05-28",
                75,
                "Superseded"
        );

        createBaseline(
                repository,
                "v1.0",
                "Initial Baseline detailing simple customer signup",
                "Sarah Johnson",
                "2026-05-10",
                52,
                "Superseded"
        );
    }


    private void createApproval(
            ApprovalRepository repository,
            String code,
            String title,
            ApprovalType type,
            String requestedBy,
            String requestedOn
    ) {

        Approval approval =
                new Approval(
                        1L,
                        title,
                        type,
                        requestedBy,
                        LocalDate.parse(requestedOn)
                );

        approval.setCode(code);

        repository.save(
                approval
        );

        System.out.println(
                "Created approval: "
                        + code
                        + " / "
                        + title
        );
    }


    private void createBaseline(
            BaselineRepository repository,
            String version,
            String description,
            String createdBy,
            String createdAt,
            int reqCount,
            String status
    ) {

        Baseline baseline =
                new Baseline(
                        1L,
                        version,
                        description,
                        createdBy,
                        LocalDate.parse(createdAt),
                        reqCount,
                        status
                );

        repository.save(
                baseline
        );

        System.out.println(
                "Created baseline: "
                        + version
                        + " / "
                        + status
        );
    }
}
