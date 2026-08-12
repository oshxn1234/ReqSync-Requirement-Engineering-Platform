package com.reqsync.reqsync_backend.ai.client;

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

            @Value("${gemini.api.key}")
            String apiKey,

            @Value("${gemini.api.base-url}")
            String baseUrl,

            @Value("${gemini.api.model}")
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


    /**
     * Sends a text prompt to Gemini
     * and returns Gemini's generated text.
     */
    public String generateText(
            String prompt
    ) {

        if (
                prompt == null ||
                        prompt.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Prompt cannot be empty."
            );
        }


        /*
         * Build Gemini request body.
         */
        Map<String, Object> requestBody =
                Map.of(
                        "contents",
                        List.of(
                                Map.of(
                                        "parts",
                                        List.of(
                                                Map.of(
                                                        "text",
                                                        prompt
                                                )
                                        )
                                )
                        )
                );


        /*
         * Send request to Gemini.
         *
         * IMPORTANT:
         *
         * We use Map instead of JsonNode
         * because Spring Boot 4 uses
         * Jackson 3 internally.
         */
        Map<String, Object> response =
                restClient
                        .post()
                        .uri(
                                "/models/{model}:generateContent",
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
                    "Empty response from Gemini API."
            );
        }


        /*
         * Gemini response structure:
         *
         * {
         *   "candidates": [
         *     {
         *       "content": {
         *         "parts": [
         *           {
         *             "text": "..."
         *           }
         *         ]
         *       }
         *     }
         *   ]
         * }
         */


        Object candidatesObject =
                response.get(
                        "candidates"
                );


        if (
                !(candidatesObject
                        instanceof List<?> candidates)
                        ||
                        candidates.isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini returned no candidates. Response: "
                            + response
            );
        }


        Object firstCandidateObject =
                candidates.get(0);


        if (
                !(firstCandidateObject
                        instanceof Map<?, ?> firstCandidate)
        ) {

            throw new RuntimeException(
                    "Invalid Gemini candidate structure."
            );
        }


        Object contentObject =
                firstCandidate.get(
                        "content"
                );


        if (
                !(contentObject
                        instanceof Map<?, ?> content)
        ) {

            throw new RuntimeException(
                    "Gemini response contains no content."
            );
        }


        Object partsObject =
                content.get(
                        "parts"
                );


        if (
                !(partsObject
                        instanceof List<?> parts)
                        ||
                        parts.isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini response contains no text parts."
            );
        }


        Object firstPartObject =
                parts.get(0);


        if (
                !(firstPartObject
                        instanceof Map<?, ?> firstPart)
        ) {

            throw new RuntimeException(
                    "Invalid Gemini text part."
            );
        }


        Object textObject =
                firstPart.get(
                        "text"
                );


        if (
                !(textObject
                        instanceof String text)
                        ||
                        text.isBlank()
        ) {

            throw new RuntimeException(
                    "Gemini returned empty content."
            );
        }


        return text;
    }
}