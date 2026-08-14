package com.reqsync.reqsync_backend.requirement.repository;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SemanticSearchRepository {

    private final JdbcTemplate jdbcTemplate;


    public SemanticSearchRepository(
            JdbcTemplate jdbcTemplate
    ) {

        this.jdbcTemplate =
                jdbcTemplate;
    }


    /**
     * Save or replace an embedding
     * belonging to a requirement.
     */
    public void updateEmbedding(
            Long requirementId,
            String vector
    ) {

        String sql =
                """
                UPDATE requirements
                SET embedding = CAST(? AS vector)
                WHERE id = ?
                """;


        int affectedRows =
                jdbcTemplate.update(
                        sql,
                        vector,
                        requirementId
                );


        if (affectedRows == 0) {

            throw new RuntimeException(
                    "Requirement not found while storing embedding: "
                            + requirementId
            );
        }
    }


    /**
     * Search ALL requirements belonging to
     * a project.
     */
    public List<SimilarRequirementResponse>
    searchProject(
            Long projectId,
            String queryVector,
            int limit
    ) {

        String sql =
                """
                SELECT
                    id,
                    requirement_code,
                    title,
                    description,
                    1 - (
                        embedding <=>
                        CAST(? AS vector)
                    ) AS similarity
                FROM requirements
                WHERE project_id = ?
                  AND embedding IS NOT NULL
                ORDER BY
                    embedding <=>
                    CAST(? AS vector)
                LIMIT ?
                """;


        return jdbcTemplate.query(
                sql,

                (resultSet, rowNumber) ->
                        new SimilarRequirementResponse(

                                resultSet.getLong(
                                        "id"
                                ),

                                resultSet.getString(
                                        "requirement_code"
                                ),

                                resultSet.getString(
                                        "title"
                                ),

                                resultSet.getString(
                                        "description"
                                ),

                                resultSet.getDouble(
                                        "similarity"
                                )
                        ),

                queryVector,
                projectId,
                queryVector,
                limit
        );
    }


    /**
     * Search other requirements within
     * the same project while excluding
     * one selected requirement.
     *
     * This is what completeness analysis
     * will mainly use.
     */
    public List<SimilarRequirementResponse>
    searchProjectExcludingRequirement(
            Long projectId,
            Long excludedRequirementId,
            String queryVector,
            int limit
    ) {

        String sql =
                """
                SELECT
                    id,
                    requirement_code,
                    title,
                    description,
                    1 - (
                        embedding <=>
                        CAST(? AS vector)
                    ) AS similarity
                FROM requirements
                WHERE project_id = ?
                  AND id <> ?
                  AND embedding IS NOT NULL
                ORDER BY
                    embedding <=>
                    CAST(? AS vector)
                LIMIT ?
                """;


        return jdbcTemplate.query(
                sql,

                (resultSet, rowNumber) ->
                        new SimilarRequirementResponse(

                                resultSet.getLong(
                                        "id"
                                ),

                                resultSet.getString(
                                        "requirement_code"
                                ),

                                resultSet.getString(
                                        "title"
                                ),

                                resultSet.getString(
                                        "description"
                                ),

                                resultSet.getDouble(
                                        "similarity"
                                )
                        ),

                queryVector,
                projectId,
                excludedRequirementId,
                queryVector,
                limit
        );
    }


    /**
     * Check whether a requirement already
     * contains an embedding.
     */
    public boolean hasEmbedding(
            Long requirementId
    ) {

        String sql =
                """
                SELECT COUNT(*)
                FROM requirements
                WHERE id = ?
                  AND embedding IS NOT NULL
                """;


        Integer count =
                jdbcTemplate.queryForObject(
                        sql,
                        Integer.class,
                        requirementId
                );


        return count != null
                && count > 0;
    }


    /**
     * Count how many requirements belonging
     * to a project already contain embeddings.
     */
    public int countProjectEmbeddings(
            Long projectId
    ) {

        String sql =
                """
                SELECT COUNT(*)
                FROM requirements
                WHERE project_id = ?
                  AND embedding IS NOT NULL
                """;


        Integer count =
                jdbcTemplate.queryForObject(
                        sql,
                        Integer.class,
                        projectId
                );


        return count == null
                ? 0
                : count;
    }
}