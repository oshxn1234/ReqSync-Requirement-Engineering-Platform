package com.reqsync.reqsync_backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GeminiEmbeddingClient {

    private final RestClient restClient;

    private final String model;

    private final int dimension;


    public GeminiEmbeddingClient(
            RestClient.Builder builder,

            @Value("${gemini.api.key}")
            String apiKey,

            @Value("${gemini.api.base-url}")
            String baseUrl,

            @Value("${gemini.embedding.model}")
            String model,

            @Value("${gemini.embedding.dimension}")
            int dimension
    ) {

        this.model = model;

        this.dimension = dimension;

        this.restClient =
                builder
                        .baseUrl(baseUrl)
                        .defaultHeader(
                                "x-goog-api-key",
                                apiKey
                        )
                        .build();
    }


    /**
     * Convert text into an embedding vector.
     *
     * The returned vector contains 768 values
     * because our PostgreSQL column is vector(768).
     */
    public float[] generateEmbedding(
            String text
    ) {

        if (
                text == null ||
                        text.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Text for embedding cannot be empty."
            );
        }


        /*
         * Request sent to Gemini Embedding API.
         */
        Map<String, Object> requestBody =
                Map.of(

                        "model",
                        "models/" + model,

                        "content",
                        Map.of(
                                "parts",
                                List.of(
                                        Map.of(
                                                "text",
                                                text
                                        )
                                )
                        ),

                        /*
                         * We use SEMANTIC_SIMILARITY
                         * because requirements will be
                         * compared by meaning.
                         */
                        "taskType",
                        "SEMANTIC_SIMILARITY",

                        /*
                         * Must match PostgreSQL
                         * vector(768).
                         */
                        "outputDimensionality",
                        dimension
                );


        Map<String, Object> response =
                restClient
                        .post()
                        .uri(
                                "/models/{model}:embedContent",
                                model
                        )
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .body(
                                requestBody
                        )
                        .retrieve()
                        .body(
                                Map.class
                        );


        if (response == null) {

            throw new RuntimeException(
                    "Gemini Embedding API returned an empty response."
            );
        }


        Object embeddingObject =
                response.get(
                        "embedding"
                );


        if (
                !(embeddingObject
                        instanceof Map<?, ?> embedding)
        ) {

            throw new RuntimeException(
                    "Gemini embedding response does not contain an embedding."
            );
        }


        Object valuesObject =
                embedding.get(
                        "values"
                );


        if (
                !(valuesObject
                        instanceof List<?> values)
                        ||
                        values.isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini embedding response contains no values."
            );
        }


        if (
                values.size() != dimension
        ) {

            throw new RuntimeException(
                    "Expected "
                            + dimension
                            + " embedding dimensions but received "
                            + values.size()
            );
        }


        float[] result =
                new float[
                        values.size()
                        ];


        for (
                int i = 0;
                i < values.size();
                i++
        ) {

            Object value =
                    values.get(i);


            if (
                    !(value instanceof Number number)
            ) {

                throw new RuntimeException(
                        "Invalid value inside embedding vector."
                );
            }


            result[i] =
                    number.floatValue();
        }


        return result;
    }
}