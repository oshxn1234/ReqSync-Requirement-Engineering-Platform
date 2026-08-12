package com.reqsync.reqsync_backend.requirement.service.semantic;

import com.reqsync.reqsync_backend.ai.client.GeminiEmbeddingClient;
import com.reqsync.reqsync_backend.requirement.repository.SemanticSearchRepository;
import org.springframework.stereotype.Service;

//@Service
public class RequirementEmbeddingService {

    private final GeminiEmbeddingClient embeddingClient;

    private final SemanticSearchRepository semanticSearchRepository;


    public RequirementEmbeddingService(
            GeminiEmbeddingClient embeddingClient,
            SemanticSearchRepository semanticSearchRepository
    ) {

        this.embeddingClient = embeddingClient;

        this.semanticSearchRepository =
                semanticSearchRepository;
    }


    /**
     * Generate an embedding for a stored requirement
     * and save the vector into PostgreSQL.
     */
    public void generateAndStore(
            Long requirementId,
            String text
    ) {

        if (requirementId == null) {

            throw new IllegalArgumentException(
                    "Requirement ID cannot be null."
            );
        }

        if (text == null || text.isBlank()) {

            throw new IllegalArgumentException(
                    "Requirement text cannot be empty."
            );
        }


        /*
         * Gemini returns float[].
         */
        float[] embedding =
                embeddingClient.generateEmbedding(
                        text
                );


        /*
         * Convert float[] into PostgreSQL vector syntax:
         *
         * [0.12,-0.47,0.85,...]
         */
        String vectorLiteral =
                toVectorLiteral(
                        embedding
                );


        /*
         * Save vector to requirements.embedding.
         */
        semanticSearchRepository.updateEmbedding(
                requirementId,
                vectorLiteral
        );
    }


    /**
     * Generate an embedding for search text.
     *
     * This vector is temporary and is NOT
     * stored in PostgreSQL.
     */
    public String createSearchVector(
            String text
    ) {

        if (text == null || text.isBlank()) {

            throw new IllegalArgumentException(
                    "Search text cannot be empty."
            );
        }

        float[] embedding =
                embeddingClient.generateEmbedding(
                        text
                );

        return toVectorLiteral(
                embedding
        );
    }


    /**
     * Convert float array into pgvector syntax.
     */
    private String toVectorLiteral(
            float[] embedding
    ) {

        StringBuilder builder =
                new StringBuilder();

        builder.append("[");

        for (int i = 0;
             i < embedding.length;
             i++) {

            if (i > 0) {
                builder.append(",");
            }

            builder.append(
                    embedding[i]
            );
        }

        builder.append("]");

        return builder.toString();
    }
}