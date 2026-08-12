package com.reqsync.reqsync_backend.requirement.repository;

import com.reqsync.reqsync_backend.requirement.dto.SimilarRequirementResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

//@Repository
public class SemanticSearchRepository {

    private final JdbcTemplate jdbcTemplate;

    public SemanticSearchRepository(
            JdbcTemplate jdbcTemplate
    ) {

        this.jdbcTemplate = jdbcTemplate;
    }

    public void updateEmbedding(
            Long requirementId,
            String vector
    ) {

        String sql = """
                UPDATE requirements
                SET embedding = CAST(? AS vector)
                WHERE id = ?
                """;

        jdbcTemplate.update(
                sql,
                vector,
                requirementId
        );
    }

    public List<SimilarRequirementResponse>
    searchProjectExceptSelected(
            Long projectId,
            Long selectedRequirementId,
            String vector,
            int limit
    ) {

        String sql = """
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

                (rs, rowNum) ->
                        new SimilarRequirementResponse(
                                rs.getLong("id"),
                                rs.getString(
                                        "requirement_code"
                                ),
                                rs.getString("title"),
                                rs.getString(
                                        "description"
                                ),
                                rs.getDouble(
                                        "similarity"
                                )
                        ),

                vector,
                projectId,
                selectedRequirementId,
                vector,
                limit
        );
    }

    public List<SimilarRequirementResponse>
    searchWholeProject(
            Long projectId,
            String vector,
            int limit
    ) {

        String sql = """
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

                (rs, rowNum) ->
                        new SimilarRequirementResponse(
                                rs.getLong("id"),
                                rs.getString(
                                        "requirement_code"
                                ),
                                rs.getString("title"),
                                rs.getString(
                                        "description"
                                ),
                                rs.getDouble(
                                        "similarity"
                                )
                        ),

                vector,
                projectId,
                vector,
                limit
        );
    }
}