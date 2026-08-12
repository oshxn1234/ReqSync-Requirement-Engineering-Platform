package com.reqsync.reqsync_backend.requirement.service.semantic;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import com.reqsync.reqsync_backend.requirement.repository.SemanticSearchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

//@Service
public class SemanticSearchService {

    private final RequirementEmbeddingService
            embeddingService;

    private final SemanticSearchRepository
            semanticSearchRepository;


    public SemanticSearchService(
            RequirementEmbeddingService embeddingService,
            SemanticSearchRepository semanticSearchRepository
    ) {

        this.embeddingService =
                embeddingService;

        this.semanticSearchRepository =
                semanticSearchRepository;
    }


    /**
     * Used when checking ONE selected requirement.
     *
     * Search every OTHER requirement
     * belonging to the same project.
     */
    public List<SimilarRequirementResponse>
    searchForSelectedRequirement(
            Long projectId,
            Long selectedRequirementId,
            String searchText
    ) {

        String vector =
                embeddingService.createSearchVector(
                        searchText
                );

        return semanticSearchRepository
                .searchProjectExceptSelected(
                        projectId,
                        selectedRequirementId,
                        vector,
                        5
                );
    }


    /**
     * Used for project-wide completeness.
     *
     * Search ALL requirements
     * belonging to the project.
     */
    public List<SimilarRequirementResponse>
    searchWholeProject(
            Long projectId,
            String searchText
    ) {

        String vector =
                embeddingService.createSearchVector(
                        searchText
                );

        return semanticSearchRepository
                .searchWholeProject(
                        projectId,
                        vector,
                        5
                );
    }
}