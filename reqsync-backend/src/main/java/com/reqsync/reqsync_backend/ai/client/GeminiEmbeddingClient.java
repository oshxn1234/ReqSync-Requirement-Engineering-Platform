package com.reqsync.reqsync_backend.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

//@Component
public class GeminiEmbeddingClient {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.embedding.model}")
    private String model;

    @Value("${gemini.embedding.dimension}")
    private int dimension;

    public GeminiEmbeddingClient(
            RestClient.Builder builder
    ) {

        this.restClient =
                builder
                        .baseUrl(
                                "https://generativelanguage.googleapis.com"
                        )
                        .build();
    }

    public float[] generateEmbedding(
            String text
    ) {

        if (text == null ||
                text.isBlank()) {

            throw new IllegalArgumentException(
                    "Embedding text cannot be empty."
            );
        }

        Map<String, Object> body =
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

                        "outputDimensionality",
                        dimension
                );

        Map response =
                restClient
                        .post()
                        .uri(
                                "/v1beta/models/"
                                        + model
                                        + ":embedContent"
                        )
                        .header(
                                "x-goog-api-key",
                                apiKey
                        )
                        .body(body)
                        .retrieve()
                        .body(Map.class);

        if (response == null) {

            throw new RuntimeException(
                    "Embedding API returned no response."
            );
        }

        Map embedding =
                (Map) response.get(
                        "embedding"
                );

        if (embedding == null) {

            throw new RuntimeException(
                    "Embedding response missing."
            );
        }

        List<Number> values =
                (List<Number>)
                        embedding.get(
                                "values"
                        );

        if (values == null ||
                values.isEmpty()) {

            throw new RuntimeException(
                    "Embedding values missing."
            );
        }

        float[] result =
                new float[
                        values.size()
                        ];

        for (int i = 0;
             i < values.size();
             i++) {

            result[i] =
                    values
                            .get(i)
                            .floatValue();
        }

        return result;
    }
}