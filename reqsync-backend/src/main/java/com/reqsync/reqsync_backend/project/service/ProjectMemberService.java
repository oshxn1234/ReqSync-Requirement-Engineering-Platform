package com.reqsync.reqsync_backend.project.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.project.dto.ProjectMemberResponse;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.entity.ProjectMember;

import com.reqsync.reqsync_backend.project.enums.ProjectStatus;

import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ProjectMemberService {

    private final ProjectRepository
            projectRepository;

    private final ProjectMemberRepository
            projectMemberRepository;

    private final UserRepository
            userRepository;


    public ProjectMemberService(
            ProjectRepository projectRepository,
            ProjectMemberRepository projectMemberRepository,
            UserRepository userRepository
    ) {

        this.projectRepository =
                projectRepository;

        this.projectMemberRepository =
                projectMemberRepository;

        this.userRepository =
                userRepository;
    }


    // ==========================================
    // ADD EXISTING EMPLOYEE
    // ==========================================

    public ProjectMemberResponse addMember(
            Long projectId,
            Long userId,
            Authentication authentication
    ) {

        User projectManager =
                getAuthenticatedUser(
                        authentication
                );


        if (
                projectManager.getRole()
                        != Role.PROJECT_MANAGER
        ) {

            throw new RuntimeException(
                    "Only Project Managers can add project members."
            );
        }


        Project project =
                getManagedProject(
                        projectId,
                        projectManager
                );


        /*
         * Completed projects must be immutable.
         */
        validateProjectIsEditable(
                project
        );


        Long businessId =
                projectManager
                        .getBusiness()
                        .getId();


        /*
         * Employee must belong to same business.
         */
        User member =
                userRepository
                        .findByIdAndBusinessId(
                                userId,
                                businessId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Employee not found or does not belong to your business."
                                        )
                        );


        validateProjectMemberRole(
                member.getRole()
        );


        if (
                !member.isEnabled()
        ) {

            throw new RuntimeException(
                    "Employee account is disabled."
            );
        }


        if (
                member.isAccountLocked()
        ) {

            throw new RuntimeException(
                    "Employee account is locked."
            );
        }


        var existingMembership =
                projectMemberRepository
                        .findByProjectIdAndUserId(
                                projectId,
                                userId
                        );


        if (
                existingMembership.isPresent()
        ) {

            ProjectMember membership =
                    existingMembership.get();


            /*
             * Reactivate employee if they were
             * previously removed.
             */
            if (
                    !membership.isActive()
            ) {

                membership.setActive(
                        true
                );

                membership.setAssignedAt(
                        LocalDateTime.now()
                );

                membership.setRemovedAt(
                        null
                );


                return toResponse(
                        projectMemberRepository
                                .save(
                                        membership
                                )
                );
            }


            throw new RuntimeException(
                    "Employee is already assigned to this project."
            );
        }


        ProjectMember membership =
                new ProjectMember();

        membership.setProject(
                project
        );

        membership.setUser(
                member
        );

        membership.setActive(
                true
        );


        ProjectMember savedMembership =
                projectMemberRepository
                        .save(
                                membership
                        );


        return toResponse(
                savedMembership
        );
    }


    // ==========================================
    // GET PROJECT MEMBERS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ProjectMemberResponse>
    getProjectMembers(
            Long projectId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        /*
         * Ensure project belongs to user's business.
         */
        Project project =
                projectRepository
                        .findByIdAndBusinessId(
                                projectId,
                                currentUser
                                        .getBusiness()
                                        .getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found or does not belong to your business."
                                        )
                        );


        return projectMemberRepository
                .findByProjectIdAndActiveTrue(
                        project.getId()
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // REMOVE PROJECT MEMBER
    // ==========================================

    public void removeMember(
            Long projectId,
            Long userId,
            Authentication authentication
    ) {

        User projectManager =
                getAuthenticatedUser(
                        authentication
                );


        if (
                projectManager.getRole()
                        != Role.PROJECT_MANAGER
        ) {

            throw new RuntimeException(
                    "Only Project Managers can remove project members."
            );
        }


        Project project =
                getManagedProject(
                        projectId,
                        projectManager
                );


        /*
         * Completed projects must be immutable.
         */
        validateProjectIsEditable(
                project
        );


        ProjectMember membership =
                projectMemberRepository
                        .findByProjectIdAndUserId(
                                projectId,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project membership not found."
                                        )
                        );


        if (
                !membership.isActive()
        ) {

            throw new RuntimeException(
                    "Employee has already been removed from this project."
            );
        }


        membership.setActive(
                false
        );


        membership.setRemovedAt(
                LocalDateTime.now()
        );


        projectMemberRepository.save(
                membership
        );
    }


    // ==========================================
    // VERIFY MANAGED PROJECT
    // ==========================================

    private Project getManagedProject(
            Long projectId,
            User projectManager
    ) {

        Project project =
                projectRepository
                        .findByIdAndBusinessId(
                                projectId,
                                projectManager
                                        .getBusiness()
                                        .getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Project not found or does not belong to your business."
                                        )
                        );


        if (
                project.getProjectManager() == null
        ) {

            throw new RuntimeException(
                    "This project does not have an assigned Project Manager."
            );
        }


        if (
                !project
                        .getProjectManager()
                        .getId()
                        .equals(
                                projectManager.getId()
                        )
        ) {

            throw new RuntimeException(
                    "You are not the assigned Project Manager for this project."
            );
        }


        return project;
    }


    // ==========================================
    // VERIFY PROJECT IS EDITABLE
    // ==========================================

    private void validateProjectIsEditable(
            Project project
    ) {

        if (
                project.getStatus()
                        == ProjectStatus.COMPLETED
        ) {

            throw new RuntimeException(
                    "Project members cannot be modified after the project is completed."
            );
        }
    }


    // ==========================================
    // VALID PROJECT MEMBER ROLES
    // ==========================================

    private void validateProjectMemberRole(
            Role role
    ) {

        if (
                role != Role.BUSINESS_ANALYST
                        &&
                        role != Role.DEVELOPER
                        &&
                        role != Role.QA_ENGINEER
        ) {

            throw new RuntimeException(
                    "Only Business Analysts, Developers "
                            + "and QA Engineers can be assigned "
                            + "as project members."
            );
        }
    }


    // ==========================================
    // AUTH USER
    // ==========================================

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


    // ==========================================
    // RESPONSE
    // ==========================================

    private ProjectMemberResponse toResponse(
            ProjectMember membership
    ) {

        User user =
                membership.getUser();

        Project project =
                membership.getProject();


        return new ProjectMemberResponse(
                membership.getId(),
                project.getId(),
                project.getProjectNumber(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                membership.isActive(),
                membership.getAssignedAt()
        );
    }
}