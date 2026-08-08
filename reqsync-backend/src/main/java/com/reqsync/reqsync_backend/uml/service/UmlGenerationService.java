package com.reqsync.reqsync_backend.uml.service;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;
import com.reqsync.reqsync_backend.uml.dto.RequirementForUml;
import com.reqsync.reqsync_backend.uml.dto.UmlDiagramSummaryResponse;
import com.reqsync.reqsync_backend.uml.dto.UmlEditRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationResponse;
import com.reqsync.reqsync_backend.uml.entity.ClassDiagramVersion;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
public class UmlGenerationService {

    private final GeminiClient geminiClient;
    private final PlantUmlSanitizer plantUmlSanitizer;
    private final PlantUmlRenderService plantUmlRenderService;

    public UmlGenerationService(
            GeminiClient geminiClient,
            PlantUmlSanitizer plantUmlSanitizer,
            PlantUmlRenderService plantUmlRenderService
    ) {
        this.geminiClient = geminiClient;
        this.plantUmlSanitizer = plantUmlSanitizer;
        this.plantUmlRenderService = plantUmlRenderService;
    }

    /*
     * ============================================================
     * 1. GENERATE UML DIAGRAM
     * ============================================================
     */

    public UmlGenerationResponse generate(
            UmlGenerationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Generation request cannot be null."
            );
        }

        String prompt = buildPrompt(request);

        String generatedPlantUml =
                geminiClient.generateText(prompt);

        if (generatedPlantUml == null ||
                generatedPlantUml.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response."
            );
        }

        String sanitizedPlantUml =
                plantUmlSanitizer.sanitize(
                        generatedPlantUml
                );

        String svg =
                plantUmlRenderService.renderToSvg(
                        sanitizedPlantUml
                );

        String svgBase64 =
                Base64.getEncoder().encodeToString(
                        svg.getBytes(StandardCharsets.UTF_8)
                );

        return new UmlGenerationResponse(
                null,
                1,
                sanitizedPlantUml,
                svgBase64
        );
    }

    /*
     * ============================================================
     * 2. GET LATEST DIAGRAM
     * ============================================================
     *
     * Temporary implementation.
     *
     * We will connect this to ClassDiagramRepository after
     * confirming the fields in your entity.
     */

    public UmlGenerationResponse getLatest(
            Long diagramId
    ) {

        throw new UnsupportedOperationException(
                "getLatest() database implementation is not connected yet."
        );
    }

    /*
     * ============================================================
     * 3. SAVE EDITED VERSION
     * ============================================================
     *
     * Temporary implementation.
     *
     * This will:
     *
     * Controller
     *      ↓
     * UmlGenerationService
     *      ↓
     * ClassDiagramVersionRepository
     *      ↓
     * PostgreSQL
     *
     * after we connect the entities and repositories.
     */

    public UmlGenerationResponse saveEditedVersion(
            Long diagramId,
            UmlEditRequest request
    ) {

        if (diagramId == null) {
            throw new IllegalArgumentException(
                    "Diagram ID cannot be null."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Edit request cannot be null."
            );
        }

        throw new UnsupportedOperationException(
                "saveEditedVersion() database implementation is not connected yet."
        );
    }

    /*
     * ============================================================
     * 4. GET ALL VERSIONS
     * ============================================================
     */

    public List<ClassDiagramVersion> findVersions(
            Long diagramId
    ) {

        if (diagramId == null) {
            throw new IllegalArgumentException(
                    "Diagram ID cannot be null."
            );
        }

        throw new UnsupportedOperationException(
                "findVersions() database implementation is not connected yet."
        );
    }

    /*
     * ============================================================
     * 5. GET DIAGRAMS FOR PROJECT
     * ============================================================
     */

    public List<UmlDiagramSummaryResponse> findByProject(
            Long projectId
    ) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }

        throw new UnsupportedOperationException(
                "findByProject() database implementation is not connected yet."
        );
    }

    /*
     * ============================================================
     * BUILD GEMINI PROMPT
     * ============================================================
     */

    private String buildPrompt(
            UmlGenerationRequest request
    ) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are a software engineering expert.

                Generate a UML Class Diagram in PlantUML format
                based only on the provided software requirements.

                IMPORTANT RULES:

                1. Return ONLY PlantUML code.
                2. Start with @startuml.
                3. End with @enduml.
                4. Do not use Markdown code fences.
                5. Identify appropriate classes from the requirements.
                6. Identify important attributes.
                7. Identify important methods.
                8. Identify relationships between classes.
                9. Use appropriate UML relationships such as:
                   - association
                   - inheritance
                   - aggregation
                   - composition
                   - dependency
                10. Do not invent unnecessary classes.
                11. Keep the diagram understandable.

                Project:
                """);

        prompt.append(request.projectName())
                .append("\n\n");

        prompt.append("Requirements:\n");

        for (RequirementForUml requirement :
                request.requirements()) {

            prompt.append("\n");

            prompt.append("Requirement Code: ")
                    .append(requirement.code())
                    .append("\n");

            prompt.append("Title: ")
                    .append(requirement.title())
                    .append("\n");

            prompt.append("Description: ")
                    .append(requirement.description())
                    .append("\n");

            prompt.append("Type: ")
                    .append(requirement.type())
                    .append("\n");
        }

        prompt.append("""
                
                Generate the final PlantUML class diagram now.
                """);

        return prompt.toString();
    }
}