package com.reqsync.reqsync_backend.requirement.service.semantic;

import com.reqsync.reqsync_backend.ai.client.GeminiEmbeddingClient;
import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.requirement.repository.SemanticSearchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RequirementEmbeddingService {

    private final GeminiEmbeddingClient
            geminiEmbeddingClient;

    private final SemanticSearchRepository
            semanticSearchRepository;

    private final RequirementRepository
            requirementRepository;


    public RequirementEmbeddingService(
            GeminiEmbeddingClient geminiEmbeddingClient,
            SemanticSearchRepository semanticSearchRepository,
            RequirementRepository requirementRepository
    ) {

        this.geminiEmbeddingClient =
                geminiEmbeddingClient;

        this.semanticSearchRepository =
                semanticSearchRepository;

        this.requirementRepository =
                requirementRepository;
    }


    /**
     * Generate and save an embedding
     * for ONE requirement.
     */
    @Transactional
    public void generateAndStoreEmbedding(
            Long requirementId
    ) {

        Requirement requirement =
                requirementRepository
                        .findById(
                                requirementId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Requirement not found: "
                                                        + requirementId
                                        )
                        );


        String text =
                buildRequirementText(
                        requirement
                );


        float[] embedding =
                geminiEmbeddingClient
                        .generateEmbedding(
                                text
                        );


        String vector =
                convertToVectorString(
                        embedding
                );


        semanticSearchRepository
                .updateEmbedding(
                        requirementId,
                        vector
                );
    }


    /**
     * Generate embeddings for every
     * requirement belonging to a project.
     *
     * This is useful for requirements that
     * were already stored before semantic
     * search was implemented.
     */
    @Transactional
    public int generateProjectEmbeddings(
            Long projectId
    ) {

        List<Requirement> requirements =
                requirementRepository
                        .findByProjectId(
                                projectId
                        );


        if (requirements.isEmpty()) {

            throw new RuntimeException(
                    "No requirements found for project: "
                            + projectId
            );
        }


        int generatedCount = 0;


        for (
                Requirement requirement
                : requirements
        ) {

            /*
             * Avoid unnecessary Gemini calls
             * if the embedding already exists.
             */
            if (
                    semanticSearchRepository
                            .hasEmbedding(
                                    requirement.getId()
                            )
            ) {

                continue;
            }


            String text =
                    buildRequirementText(
                            requirement
                    );


            float[] embedding =
                    geminiEmbeddingClient
                            .generateEmbedding(
                                    text
                            );


            String vector =
                    convertToVectorString(
                            embedding
                    );


            semanticSearchRepository
                    .updateEmbedding(
                            requirement.getId(),
                            vector
                    );


            generatedCount++;
        }


        return generatedCount;
    }


    /**
     * Generate a temporary query embedding.
     *
     * This is NOT saved into PostgreSQL.
     */
    public String generateQueryVector(
            String searchText
    ) {

        if (
                searchText == null ||
                        searchText.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Semantic search text cannot be empty."
            );
        }


        float[] embedding =
                geminiEmbeddingClient
                        .generateEmbedding(
                                searchText
                        );


        return convertToVectorString(
                embedding
        );
    }


    /**
     * Construct meaningful text for
     * semantic comparison.
     *
     * Both title and description are included.
     */
    private String buildRequirementText(
            Requirement requirement
    ) {

        StringBuilder text =
                new StringBuilder();


        if (
                requirement.getTitle()
                        != null
        ) {

            text.append(
                    requirement.getTitle()
            );

            text.append(". ");
        }


        if (
                requirement.getDescription()
                        != null
        ) {

            text.append(
                    requirement.getDescription()
            );
        }


        return text.toString();
    }


    /**
     * Convert:
     *
     * float[]
     *
     * into pgvector format:
     *
     * [0.12,-0.53,0.88,...]
     */
    private String convertToVectorString(
            float[] embedding
    ) {

        StringBuilder builder =
                new StringBuilder();


        builder.append(
                "["
        );


        for (
                int index = 0;
                index < embedding.length;
                index++
        ) {

            if (index > 0) {

                builder.append(
                        ","
                );
            }


            builder.append(
                    embedding[index]
            );
        }


        builder.append(
                "]"
        );


        return builder.toString();
    }
}