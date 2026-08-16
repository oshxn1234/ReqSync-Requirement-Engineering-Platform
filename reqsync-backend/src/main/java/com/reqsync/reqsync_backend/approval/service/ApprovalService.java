package com.reqsync.reqsync_backend.approval.service;

import com.reqsync.reqsync_backend.approval.dto.ApprovalResponse;
import com.reqsync.reqsync_backend.approval.dto.CreateApprovalRequest;
import com.reqsync.reqsync_backend.approval.entity.Approval;
import com.reqsync.reqsync_backend.approval.enums.ApprovalStatus;
import com.reqsync.reqsync_backend.approval.enums.ApprovalType;
import com.reqsync.reqsync_backend.approval.repository.ApprovalRepository;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.baseline.entity.Baseline;
import com.reqsync.reqsync_backend.baseline.repository.BaselineRepository;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ApprovalService {

    private static final Pattern REQUIREMENT_CODE_PATTERN =
            Pattern.compile("REQ-\\d+");

    private static final Pattern BASELINE_VERSION_PATTERN =
            Pattern.compile("v\\d+\\.\\d+");

    private static final String BASELINE_ACTIVE = "Active";
    private static final String BASELINE_SUPERSEDED = "Superseded";


    private final ApprovalRepository approvalRepository;

    private final UserRepository userRepository;

    private final RequirementRepository requirementRepository;

    private final BaselineRepository baselineRepository;


    public ApprovalService(
            ApprovalRepository approvalRepository,
            UserRepository userRepository,
            RequirementRepository requirementRepository,
            BaselineRepository baselineRepository
    ) {

        this.approvalRepository = approvalRepository;
        this.userRepository = userRepository;
        this.requirementRepository = requirementRepository;
        this.baselineRepository = baselineRepository;
    }


    // ==========================================
    // GET PROJECT APPROVALS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ApprovalResponse> getByProject(
            Long projectId
    ) {

        return approvalRepository
                .findByProjectIdOrderByIdAsc(
                        projectId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // CREATE APPROVAL REQUEST
    // ==========================================

    @Transactional
    public ApprovalResponse create(
            CreateApprovalRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        if (
                request.getProjectId() == null
        ) {

            throw new IllegalArgumentException(
                    "Project ID is required."
            );
        }

        if (
                request.getTitle() == null
                        ||
                        request.getTitle().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Approval title is required."
            );
        }


        Approval approval =
                new Approval(
                        request.getProjectId(),
                        request.getTitle().trim(),
                        request.getType() != null
                                ? request.getType()
                                : ApprovalType.REQUIREMENT,
                        fullName(currentUser),
                        parseDate(
                                request.getRequestedOn()
                        )
                );

        approval.setCode(
                generateCode(
                        request.getProjectId()
                )
        );


        return toResponse(
                approvalRepository.save(
                        approval
                )
        );
    }


    // ==========================================
    // APPROVE
    // ==========================================

    @Transactional
    public ApprovalResponse approve(
            String code,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Approval approval =
                getByCode(code);


        if (
                approval.getStatus()
                        == ApprovalStatus.APPROVED
        ) {

            return toResponse(
                    approval
            );
        }


        if (
                approval.getStatus()
                        == ApprovalStatus.REJECTED
        ) {

            throw new IllegalStateException(
                    "Approval "
                            + code
                            + " has already been rejected and cannot be approved."
            );
        }


        approval.setStatus(
                ApprovalStatus.APPROVED
        );

        approval.setDecidedBy(
                fullName(currentUser)
        );

        approval.setDecidedOn(
                LocalDate.now()
        );


        applyApprovalSideEffects(
                approval
        );


        return toResponse(
                approvalRepository.save(
                        approval
                )
        );
    }


    // ==========================================
    // REJECT
    // ==========================================

    @Transactional
    public ApprovalResponse reject(
            String code,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        Approval approval =
                getByCode(code);


        if (
                approval.getStatus()
                        == ApprovalStatus.REJECTED
        ) {

            return toResponse(
                    approval
            );
        }


        if (
                approval.getStatus()
                        == ApprovalStatus.APPROVED
        ) {

            throw new IllegalStateException(
                    "Approval "
                            + code
                            + " has already been approved and cannot be rejected."
            );
        }


        approval.setStatus(
                ApprovalStatus.REJECTED
        );

        approval.setDecidedBy(
                fullName(currentUser)
        );

        approval.setDecidedOn(
                LocalDate.now()
        );


        return toResponse(
                approvalRepository.save(
                        approval
                )
        );
    }


    // =========================================================
    // SIDE EFFECTS
    // =========================================================

    /**
     * Applying an approval can affect other entities:
     *
     * 1. Requirement approval -> referenced REQ code is
     *    moved to APPROVED.
     *
     * 2. Baseline approval    -> referenced baseline version
     *    becomes Active and all other versions of the same
     *    project become Superseded.
     */
    private void applyApprovalSideEffects(
            Approval approval
    ) {

        if (
                approval.getType()
                        == ApprovalType.REQUIREMENT
        ) {

            approveReferencedRequirement(
                    approval
            );
        }


        if (
                approval.getType()
                        == ApprovalType.BASELINE
        ) {

            activateReferencedBaseline(
                    approval
            );
        }
    }


    private void approveReferencedRequirement(
            Approval approval
    ) {

        Matcher matcher =
                REQUIREMENT_CODE_PATTERN
                        .matcher(
                                approval.getTitle()
                        );


        if (!matcher.find()) {
            return;
        }


        String requirementCode =
                matcher.group();


        requirementRepository
                .findByProjectIdAndCode(
                        approval.getProjectId(),
                        requirementCode
                )
                .ifPresent(
                        requirement ->
                        {

                            requirement.setStatus(
                                    RequirementStatus.APPROVED
                            );

                            requirementRepository.save(
                                    requirement
                            );
                        }
                );
    }


    private void activateReferencedBaseline(
            Approval approval
    ) {

        Matcher matcher =
                BASELINE_VERSION_PATTERN
                        .matcher(
                                approval.getTitle()
                        );


        String version =
                matcher.find()
                        ? matcher.group()
                        : null;


        if (version == null) {
            return;
        }


        Baseline baseline =
                baselineRepository
                        .findByProjectIdAndVersion(
                                approval.getProjectId(),
                                version
                        )
                        .orElseGet(
                                () -> createBaseline(
                                        approval,
                                        version
                                )
                        );


        baseline.setStatus(
                BASELINE_ACTIVE
        );

        baselineRepository.save(
                baseline
        );


        supersedeOtherBaselines(
                approval.getProjectId(),
                version
        );
    }


    private Baseline createBaseline(
            Approval approval,
            String version
    ) {

        Baseline baseline =
                new Baseline();

        baseline.setProjectId(
                approval.getProjectId()
        );

        baseline.setVersion(
                version
        );

        baseline.setDescription(
                approval.getTitle()
        );

        baseline.setCreatedBy(
                approval.getRequestedBy()
        );

        baseline.setCreatedAt(
                approval.getRequestedOn()
        );

        baseline.setReqCount(
                countApprovedRequirements(
                        approval.getProjectId()
                )
        );

        baseline.setStatus(
                BASELINE_ACTIVE
        );


        return baselineRepository.save(
                baseline
        );
    }


    private void supersedeOtherBaselines(
            Long projectId,
            String activeVersion
    ) {

        baselineRepository
                .findByProjectIdOrderByIdAsc(
                        projectId
                )
                .forEach(
                        baseline ->
                        {

                            if (
                                    !baseline.getVersion()
                                            .equals(
                                                    activeVersion
                                            )
                            ) {

                                baseline.setStatus(
                                        BASELINE_SUPERSEDED
                                );

                                baselineRepository.save(
                                        baseline
                                );
                            }
                        }
                );
    }


    private int countApprovedRequirements(
            Long projectId
    ) {

        return requirementRepository
                .findByProjectIdAndStatus(
                        projectId,
                        RequirementStatus.APPROVED
                )
                .size();
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                        authentication.getName() == null
                        ||
                        authentication.getName().isBlank()
        ) {

            throw new RuntimeException(
                    "Authenticated user could not be determined."
            );
        }


        return userRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Authenticated user not found."
                                )
                );
    }


    private Approval getByCode(
            String code
    ) {

        if (
                code == null
                        ||
                        code.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Approval code is required."
            );
        }


        return approvalRepository
                .findByCode(
                        code.trim()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Approval not found: "
                                                + code
                                )
                );
    }


    private String generateCode(
            Long projectId
    ) {

        Integer maxNumber =
                approvalRepository
                        .findMaximumApprovalNumber(
                                projectId
                        );


        long next =
                maxNumber == null
                        ? 101L
                        : maxNumber.longValue() + 1;


        String candidate =
                "APR-"
                        + String.format(
                                "%03d",
                                next
                        );


        while (
                approvalRepository.existsByCode(
                        candidate
                )
        ) {

            next++;

            candidate =
                    "APR-"
                            + String.format(
                                    "%03d",
                                    next
                            );
        }


        return candidate;
    }


    private LocalDate parseDate(
            String value
    ) {

        if (
                value == null
                        ||
                        value.isBlank()
        ) {

            return null;
        }


        return LocalDate.parse(
                value.trim()
        );
    }


    private String fullName(
            User user
    ) {

        String first =
                user.getFirstName() == null
                        ? ""
                        : user.getFirstName();

        String last =
                user.getLastName() == null
                        ? ""
                        : user.getLastName();


        return (first + " " + last)
                .trim();
    }


    private ApprovalResponse toResponse(
            Approval approval
    ) {

        return new ApprovalResponse(
                approval.getCode(),
                approval.getProjectId(),
                approval.getTitle(),
                approval.getType(),
                approval.getRequestedBy(),
                approval.getRequestedOn() != null
                        ? approval.getRequestedOn().toString()
                        : null,
                approval.getStatus(),
                approval.getDecidedBy(),
                approval.getDecidedOn() != null
                        ? approval.getDecidedOn().toString()
                        : null
        );
    }
}
