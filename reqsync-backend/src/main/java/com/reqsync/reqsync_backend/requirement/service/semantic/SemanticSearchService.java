package com.reqsync.reqsync_backend.requirement.service.semantic;

import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.repository.SemanticSearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SemanticSearchService {

    private final RequirementEmbeddingService
            requirementEmbeddingService;

    private final SemanticSearchRepository
            semanticSearchRepository;

    private final ProjectRepository
            projectRepository;

    private final RequirementRepository
            requirementRepository;


    public SemanticSearchService(
            RequirementEmbeddingService requirementEmbeddingService,
            SemanticSearchRepository semanticSearchRepository,
            ProjectRepository projectRepository,
            RequirementRepository requirementRepository
    ) {

        this.requirementEmbeddingService =
                requirementEmbeddingService;

        this.semanticSearchRepository =
                semanticSearchRepository;

        this.projectRepository =
                projectRepository;

        this.requirementRepository =
                requirementRepository;
    }


    /**
     * General semantic search across
     * ALL requirements in a project.
     */
    public List<SimilarRequirementResponse>
    searchProject(
            Long projectId,
            String searchText,
            int limit
    ) {

        validateProject(
                projectId
        );


        validateLimit(
                limit
        );


        String vector =
                requirementEmbeddingService
                        .generateQueryVector(
                                searchText
                        );


        return semanticSearchRepository
                .searchProject(
                        projectId,
                        vector,
                        limit
                );
    }


    /**
     * Search other requirements while
     * excluding a selected requirement.
     *
     * Requirement Completeness Analysis
     * will use this method.
     */
    public List<SimilarRequirementResponse>
    searchRelatedRequirements(
            Long selectedRequirementId,
            String searchText,
            int limit
    ) {

        Requirement selectedRequirement =
                requirementRepository
                        .findById(
                                selectedRequirementId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Requirement not found: "
                                                        + selectedRequirementId
                                        )
                        );


        validateLimit(
                limit
        );


        String queryVector =
                requirementEmbeddingService
                        .generateQueryVector(
                                searchText
                        );


        return semanticSearchRepository
                .searchProjectExcludingRequirement(
                        selectedRequirement.getProjectId(),
                        selectedRequirementId,
                        queryVector,
                        limit
                );
    }


    private void validateProject(
            Long projectId
    ) {

        if (
                projectId == null
        ) {

            throw new IllegalArgumentException(
                    "Project ID is required."
            );
        }


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
    }


    private void validateLimit(
            int limit
    ) {

        if (
                limit < 1 ||
                        limit > 20
        ) {

            throw new IllegalArgumentException(
                    "Semantic search limit must be between 1 and 20."
            );
        }
    }
}