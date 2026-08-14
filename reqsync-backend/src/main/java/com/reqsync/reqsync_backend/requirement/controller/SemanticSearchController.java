package com.reqsync.reqsync_backend.requirement.controller;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import com.reqsync.reqsync_backend.requirement.service.semantic.RequirementEmbeddingService;
import com.reqsync.reqsync_backend.requirement.service.semantic.SemanticSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/semantic")
public class SemanticSearchController {

    private final RequirementEmbeddingService
            requirementEmbeddingService;

    private final SemanticSearchService
            semanticSearchService;


    public SemanticSearchController(
            RequirementEmbeddingService requirementEmbeddingService,
            SemanticSearchService semanticSearchService
    ) {

        this.requirementEmbeddingService =
                requirementEmbeddingService;

        this.semanticSearchService =
                semanticSearchService;
    }


    /**
     * Generate an embedding for one
     * stored requirement.
     *
     * POST
     * /api/semantic/requirements/5/embedding
     */
    @PostMapping(
            "/requirements/{requirementId}/embedding"
    )
    public ResponseEntity<Map<String, Object>>
    generateRequirementEmbedding(
            @PathVariable
            Long requirementId
    ) {

        requirementEmbeddingService
                .generateAndStoreEmbedding(
                        requirementId
                );


        return ResponseEntity.ok(
                Map.of(
                        "requirementId",
                        requirementId,

                        "message",
                        "Requirement embedding generated successfully."
                )
        );
    }


    /**
     * Generate missing embeddings for
     * every requirement in a project.
     *
     * POST
     * /api/semantic/projects/1/embeddings
     */
    @PostMapping(
            "/projects/{projectId}/embeddings"
    )
    public ResponseEntity<Map<String, Object>>
    generateProjectEmbeddings(
            @PathVariable
            Long projectId
    ) {

        int generated =
                requirementEmbeddingService
                        .generateProjectEmbeddings(
                                projectId
                        );


        return ResponseEntity.ok(
                Map.of(
                        "projectId",
                        projectId,

                        "generatedEmbeddings",
                        generated,

                        "message",
                        "Project requirement embeddings processed successfully."
                )
        );
    }


    /**
     * General semantic search.
     *
     * GET
     * /api/semantic/projects/1/search?query=password%20recovery&limit=5
     */
    @GetMapping(
            "/projects/{projectId}/search"
    )
    public ResponseEntity<
            List<SimilarRequirementResponse>
            >
    searchProject(
            @PathVariable
            Long projectId,

            @RequestParam
            String query,

            @RequestParam(
                    defaultValue = "5"
            )
            int limit
    ) {

        return ResponseEntity.ok(

                semanticSearchService
                        .searchProject(
                                projectId,
                                query,
                                limit
                        )
        );
    }


    /**
     * Search related requirements
     * while excluding the selected
     * requirement itself.
     *
     * GET
     * /api/semantic/requirements/5/related
     * ?query=password%20recovery
     * &limit=5
     */
    @GetMapping(
            "/requirements/{requirementId}/related"
    )
    public ResponseEntity<
            List<SimilarRequirementResponse>
            >
    searchRelatedRequirements(
            @PathVariable
            Long requirementId,

            @RequestParam
            String query,

            @RequestParam(
                    defaultValue = "5"
            )
            int limit
    ) {

        return ResponseEntity.ok(

                semanticSearchService
                        .searchRelatedRequirements(
                                requirementId,
                                query,
                                limit
                        )
        );
    }
}