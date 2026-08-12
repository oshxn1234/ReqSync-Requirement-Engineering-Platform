package com.reqsync.reqsync_backend.project.service;

import com.reqsync.reqsync_backend.project.dto.ProjectCreateRequest;
import com.reqsync.reqsync_backend.project.dto.ProjectResponse;
import com.reqsync.reqsync_backend.project.dto.ProjectUpdateRequest;
import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.enums.ProjectStatus;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository
            projectRepository;


    public ProjectService(
            ProjectRepository projectRepository
    ) {

        this.projectRepository =
                projectRepository;
    }


    /**
     * Create a new project.
     */
    public ProjectResponse createProject(
            ProjectCreateRequest request
    ) {

        validateCreateRequest(
                request
        );


        if (
                projectRepository
                        .existsByNameIgnoreCase(
                                request.getName()
                        )
        ) {

            throw new RuntimeException(
                    "A project with this name already exists."
            );
        }


        Project project =
                new Project();

        project.setName(
                request.getName().trim()
        );

        project.setDescription(
                request.getDescription()
        );

        project.setStatus(
                ProjectStatus.PLANNING
        );


        Project savedProject =
                projectRepository.save(
                        project
                );


        return toResponse(
                savedProject
        );
    }


    /**
     * Get all projects.
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {

        return projectRepository
                .findAll()
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    /**
     * Get one project by ID.
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(
            Long projectId
    ) {

        Project project =
                getProjectEntity(
                        projectId
                );


        return toResponse(
                project
        );
    }


    /**
     * Get projects by status.
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse>
    getProjectsByStatus(
            ProjectStatus status
    ) {

        return projectRepository
                .findByStatus(
                        status
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    /**
     * Update a project.
     */
    public ProjectResponse updateProject(
            Long projectId,
            ProjectUpdateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Project update request cannot be null."
            );
        }


        Project project =
                getProjectEntity(
                        projectId
                );


        if (
                request.getName() != null &&
                        !request.getName().isBlank()
        ) {

            project.setName(
                    request
                            .getName()
                            .trim()
            );
        }


        if (
                request.getDescription()
                        != null
        ) {

            project.setDescription(
                    request.getDescription()
            );
        }


        if (
                request.getStatus()
                        != null
        ) {

            project.setStatus(
                    request.getStatus()
            );
        }


        Project updatedProject =
                projectRepository.save(
                        project
                );


        return toResponse(
                updatedProject
        );
    }


    /**
     * Delete project.
     */
    public void deleteProject(
            Long projectId
    ) {

        if (
                !projectRepository
                        .existsById(
                                projectId
                        )
        ) {

            throw new RuntimeException(
                    "Project not found: "
                            + projectId
            );
        }


        projectRepository.deleteById(
                projectId
        );
    }


    /**
     * Internal method that other services
     * can use to verify that a project exists.
     */
    @Transactional(readOnly = true)
    public Project getProjectEntity(
            Long projectId
    ) {

        if (projectId == null) {

            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }


        return projectRepository
                .findById(
                        projectId
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Project not found: "
                                                + projectId
                                )
                );
    }


    /**
     * Validate create request.
     */
    private void validateCreateRequest(
            ProjectCreateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Project request cannot be null."
            );
        }


        if (
                request.getName() == null ||
                        request.getName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Project name is required."
            );
        }
    }


    /**
     * Convert entity to DTO.
     */
    private ProjectResponse toResponse(
            Project project
    ) {

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}