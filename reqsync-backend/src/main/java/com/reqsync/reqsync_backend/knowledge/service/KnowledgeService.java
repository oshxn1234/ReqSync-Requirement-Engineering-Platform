package com.reqsync.reqsync_backend.knowledge.service;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.knowledge.dto.CreateKnowledgeItemRequest;
import com.reqsync.reqsync_backend.knowledge.dto.KnowledgeItemResponse;
import com.reqsync.reqsync_backend.knowledge.entity.KnowledgeItem;
import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;
import com.reqsync.reqsync_backend.knowledge.repository.KnowledgeItemRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import com.reqsync.reqsync_backend.srs.entity.SrsDocument;
import com.reqsync.reqsync_backend.srs.repository.SrsDocumentRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class KnowledgeService {

    /*
     * =================================================================
     * KNOWLEDGE VAULT
     * =================================================================
     *
     * The Knowledge Vault is the platform's shared, cross-project
     * repository of reusable knowledge (requirements templates,
     * architectural decisions, lessons learned, QA findings and
     * generated SRS documents).
     *
     * RULES:
     *
     *  1. NOT project specific.
     *     The vault aggregates historical data from EVERY completed
     *     project inside the authenticated user's business, so new
     *     projects can reuse lessons from all past work - not just
     *     the currently selected project.
     *
     *  2. Only COMPLETED projects are published.
     *     A project's data (e.g. its SRS documents) only becomes
     *     visible in the vault once the project status is COMPLETED.
     *     Work that is still in progress is never exposed as
     *     reusable knowledge.
     *
     *  3. Business scoped.
     *     Each business only sees the completed projects it owns.
     *
     *  4. Shared resources.
     *     Vault items not tied to any project (projectId == null),
     *     such as standard templates and general lessons, are always
     *     visible to every user with vault access.
     *
     * =================================================================
     */

    private final KnowledgeItemRepository
            knowledgeItemRepository;

    private final ProjectRepository
            projectRepository;

    private final SrsDocumentRepository
            srsDocumentRepository;

    private final UserRepository
            userRepository;


    public KnowledgeService(
            KnowledgeItemRepository knowledgeItemRepository,
            ProjectRepository projectRepository,
            SrsDocumentRepository srsDocumentRepository,
            UserRepository userRepository
    ) {

        this.knowledgeItemRepository =
                knowledgeItemRepository;

        this.projectRepository =
                projectRepository;

        this.srsDocumentRepository =
                srsDocumentRepository;

        this.userRepository =
                userRepository;
    }


    // ==========================================
    // GET KNOWLEDGE VAULT
    // ==========================================

    /**
     * Return every vault item that belongs to the
     * authenticated user's business.
     *
     * Only items coming from COMPLETED projects
     * are included, plus shared "general" resources
     * that are not tied to any project.
     *
     * The vault is intentionally NOT project
     * specific: all historical completed projects
     * are aggregated so new work can reuse them.
     */
    @Transactional(
            readOnly = true
    )
    public List<KnowledgeItemResponse>
    getKnowledgeVault(
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        Set<Long> completedProjectIds =
                getCompletedProjectIds(
                        currentUser
                                .getBusiness()
                                .getId()
                );

        return knowledgeItemRepository
                .findAllByOrderByIdAsc()
                .stream()
                .filter(
                        item ->
                                item.getProjectId() == null
                                        ||
                                        completedProjectIds.contains(
                                                item.getProjectId()
                                        )
                )
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // CREATE KNOWLEDGE ITEM
    // ==========================================

    @Transactional
    public KnowledgeItemResponse
    createKnowledge(
            CreateKnowledgeItemRequest request,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );

        if (
                request.getTitle() == null
                        ||
                        request.getTitle().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Knowledge item title is required."
            );
        }

        if (
                request.getProjectId() != null
        ) {

            validateCompletedProject(
                    request.getProjectId(),
                    currentUser
                            .getBusiness()
                            .getId()
            );
        }


        KnowledgeItem item =
                new KnowledgeItem();

        item.setTitle(
                request.getTitle().trim()
        );

        item.setCategory(
                request.getCategory() != null
                        ? request.getCategory()
                        : KnowledgeCategory.REQUIREMENTS
        );

        item.setProjectId(
                request.getProjectId()
        );

        item.setProjectName(
                resolveProjectName(
                        request.getProjectId(),
                        currentUser
                                .getBusiness()
                                .getId()
                )
        );

        item.setCode(
                generateCode()
        );

        item.setDate(
                LocalDate.now()
        );


        return toResponse(
                knowledgeItemRepository.save(
                        item
                )
        );
    }


    // ==========================================
    // PUBLISH PROJECT SRS TO VAULT
    // ==========================================

    /**
     * Publish every SRS document of a completed
     * project into the Knowledge Vault.
     *
     * This is triggered when a project transitions
     * to the COMPLETED status.
     */
    @Transactional
    public void publishProjectToVault(
            Project project
    ) {

        List<SrsDocument> documents =
                srsDocumentRepository
                        .findByProjectIdOrderByVersionDesc(
                                project.getId()
                        );

        for (
                SrsDocument document
                : documents
        ) {

            publishSrsToVault(
                    project,
                    document
            );
        }
    }


    /**
     * Publish a single SRS document into the vault,
     * skipping it when it was already published.
     *
     * Only called for completed projects.
     */
    @Transactional
    public void publishSrsToVault(
            Project project,
            SrsDocument document
    ) {

        if (
                project.getStatus()
                        != ProjectStatus.COMPLETED
        ) {

            return;
        }

        if (
                knowledgeItemRepository
                        .existsByReferenceTypeAndReferenceId(
                                "SRS",
                                document.getId()
                        )
        ) {

            return;
        }

        KnowledgeItem item =
                new KnowledgeItem();

        item.setCode(
                "K-"
                        + String.format(
                                "%02d",
                                knowledgeItemRepository.count() + 1
                        )
        );

        item.setProjectId(
                document.getProjectId()
        );

        item.setProjectName(
                project.getName()
        );

        item.setTitle(
                "SRS v"
                        + document.getVersion()
                        + " - "
                        + project.getName()
        );

        item.setCategory(
                KnowledgeCategory.TEMPLATES
        );

        item.setReferenceType(
                "SRS"
        );

        item.setReferenceId(
                document.getId()
        );

        item.setDate(
                LocalDate.now()
        );

        knowledgeItemRepository.save(
                item
        );
    }


    // ==========================================
    // HELPERS
    // ==========================================

    private Set<Long> getCompletedProjectIds(
            Long businessId
    ) {

        return new HashSet<>(
                projectRepository
                        .findByBusinessIdAndStatus(
                                businessId,
                                ProjectStatus.COMPLETED
                        )
                        .stream()
                        .map(
                                Project::getId
                        )
                        .toList()
        );
    }


    private void validateCompletedProject(
            Long projectId,
            Long businessId
    ) {

        Project project =
                projectRepository
                        .findByIdAndBusinessId(
                                projectId,
                                businessId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Project not found or does not belong to your business."
                                        )
                        );

        if (
                project.getStatus()
                        != ProjectStatus.COMPLETED
        ) {

            throw new IllegalArgumentException(
                    "Only data from completed projects can be added to the Knowledge Vault."
            );
        }
    }


    private String resolveProjectName(
            Long projectId,
            Long businessId
    ) {

        if (projectId == null) {

            return "General";
        }

        return projectRepository
                .findByIdAndBusinessId(
                        projectId,
                        businessId
                )
                .map(
                        Project::getName
                )
                .orElse(
                        "General"
                );
    }


    private String generateCode() {

        long next =
                knowledgeItemRepository.count() + 1;

        return "K-"
                + String.format(
                        "%02d",
                        next
                );
    }


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


    private KnowledgeItemResponse toResponse(
            KnowledgeItem item
    ) {

        return new KnowledgeItemResponse(
                item.getCode(),
                item.getTitle(),
                item.getProjectName(),
                item.getCategory(),
                item.getDate().toString(),
                item.getReferenceType(),
                item.getReferenceId()
        );
    }
}
