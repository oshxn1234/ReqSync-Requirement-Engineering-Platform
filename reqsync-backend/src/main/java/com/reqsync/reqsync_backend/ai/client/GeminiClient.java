package com.reqsync.reqsync_backend.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GeminiClient {

    private final RestClient restClient;
    private final String model;

    public GeminiClient(
            RestClient.Builder builder,

            @Value("${gemini.api-key}")
            String apiKey,

            @Value("${gemini.base-url}")
            String baseUrl,

            @Value("${gemini.model}")
            String model
    ) {

        this.model = model;

        this.restClient =
                builder
                        .baseUrl(baseUrl)
                        .defaultHeader(
                                "x-goog-api-key",
                                apiKey
                        )
                        .build();
    }

    public String generateText(String prompt) {

        Map<String, Object> requestBody =
                Map.of(

                        "contents",
                        List.of(
                                Map.of(
                                        "role",
                                        "user",

                                        "parts",
                                        List.of(
                                                Map.of(
                                                        "text",
                                                        prompt
                                                )
                                        )
                                )
                        ),

                        "generationConfig",
                        Map.of(
                                "temperature",
                                0.1,

                                "maxOutputTokens",
                                4096
                        )
                );

        JsonNode response =
                restClient
                        .post()
                        .uri(
                                "/models/{model}:generateContent",
                                model
                        )
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .body(requestBody)
                        .retrieve()
                        .body(JsonNode.class);

        if (response == null) {
            throw new RuntimeException(
                    "Gemini API returned an empty response."
            );
        }

        JsonNode candidates =
                response.path("candidates");

        if (!candidates.isArray()
                || candidates.size() == 0) {

            throw new RuntimeException(
                    "Gemini API returned no candidates."
            );
        }

        String text =
                candidates
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text")
                        .asText();

        if (text == null
                || text.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned empty diagram content."
            );
        }

        return text;
    }
}