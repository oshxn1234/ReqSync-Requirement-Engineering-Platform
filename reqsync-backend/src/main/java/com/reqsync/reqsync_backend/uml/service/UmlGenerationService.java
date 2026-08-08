package com.reqsync.reqsync_backend.uml.service;

import com.reqsync.reqsync_backend.ai.client.GeminiClient;

import com.reqsync.reqsync_backend.uml.dto.RequirementForUml;
import com.reqsync.reqsync_backend.uml.dto.UmlDiagramSummaryResponse;
import com.reqsync.reqsync_backend.uml.dto.UmlEditRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationRequest;
import com.reqsync.reqsync_backend.uml.dto.UmlGenerationResponse;

import com.reqsync.reqsync_backend.uml.entity.ClassDiagram;
import com.reqsync.reqsync_backend.uml.entity.ClassDiagramVersion;

import com.reqsync.reqsync_backend.uml.enums.DiagramSource;
import com.reqsync.reqsync_backend.uml.enums.DiagramStatus;

import com.reqsync.reqsync_backend.uml.repository.ClassDiagramRepository;
import com.reqsync.reqsync_backend.uml.repository.ClassDiagramVersionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
public class UmlGenerationService {

    private final GeminiClient geminiClient;
    private final PlantUmlSanitizer plantUmlSanitizer;
    private final PlantUmlRenderService plantUmlRenderService;

    private final ClassDiagramRepository diagramRepository;
    private final ClassDiagramVersionRepository versionRepository;


    public UmlGenerationService(
            GeminiClient geminiClient,
            PlantUmlSanitizer plantUmlSanitizer,
            PlantUmlRenderService plantUmlRenderService,
            ClassDiagramRepository diagramRepository,
            ClassDiagramVersionRepository versionRepository
    ) {

        this.geminiClient = geminiClient;
        this.plantUmlSanitizer = plantUmlSanitizer;
        this.plantUmlRenderService = plantUmlRenderService;
        this.diagramRepository = diagramRepository;
        this.versionRepository = versionRepository;
    }


    // =========================================================
    // GENERATE UML + SAVE TO DATABASE
    // =========================================================

    @Transactional
    public UmlGenerationResponse generate(
            UmlGenerationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Generation request cannot be null."
            );
        }


        // Build prompt
        String prompt =
                buildPrompt(request);


        // Call Gemini
        String generatedPlantUml =
                geminiClient.generateText(prompt);


        if (generatedPlantUml == null ||
                generatedPlantUml.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response."
            );
        }


        // Clean PlantUML
        String sanitizedPlantUml =
                plantUmlSanitizer.sanitize(
                        generatedPlantUml
                );


        // Render UML to SVG
        String svg =
                plantUmlRenderService.renderToSvg(
                        sanitizedPlantUml
                );


        // Convert SVG to Base64
        String svgBase64 =
                Base64.getEncoder()
                        .encodeToString(
                                svg.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );


        // ==========================================
        // SAVE MAIN DIAGRAM
        // ==========================================

        ClassDiagram diagram =
                ClassDiagram.builder()
                        .projectId(
                                request.projectId()
                        )
                        .name(
                                request.projectName()
                                        + " Class Diagram"
                        )
                        .status(
                                DiagramStatus.DRAFT
                        )
                        .currentVersion(1)
                        .build();


        diagram =
                diagramRepository.save(diagram);


        // ==========================================
        // SAVE VERSION 1
        // ==========================================

        ClassDiagramVersion version =
                ClassDiagramVersion.builder()
                        .diagramId(
                                diagram.getId()
                        )
                        .versionNumber(1)
                        .plantUmlCode(
                                sanitizedPlantUml
                        )
                        .source(
                                DiagramSource.AI
                        )
                        .build();


        versionRepository.save(version);


        // ==========================================
        // RETURN RESPONSE
        // ==========================================

        return new UmlGenerationResponse(
                diagram.getId(),
                1,
                sanitizedPlantUml,
                svgBase64
        );
    }


    // =========================================================
    // GET LATEST UML VERSION
    // =========================================================

    public UmlGenerationResponse getLatest(
            Long diagramId
    ) {

        if (diagramId == null) {
            throw new IllegalArgumentException(
                    "Diagram ID cannot be null."
            );
        }


        ClassDiagram diagram =
                diagramRepository
                        .findById(diagramId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "UML diagram not found."
                                        )
                        );


        ClassDiagramVersion version =
                versionRepository
                        .findTopByDiagramIdOrderByVersionNumberDesc(
                                diagramId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "No UML version found."
                                        )
                        );


        String svg =
                plantUmlRenderService.renderToSvg(
                        version.getPlantUmlCode()
                );


        String svgBase64 =
                Base64.getEncoder()
                        .encodeToString(
                                svg.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );


        return new UmlGenerationResponse(
                diagram.getId(),
                version.getVersionNumber(),
                version.getPlantUmlCode(),
                svgBase64
        );
    }


    // =========================================================
    // SAVE MANUALLY EDITED VERSION
    // =========================================================

    @Transactional
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


        ClassDiagram diagram =
                diagramRepository
                        .findById(diagramId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "UML diagram not found."
                                        )
                        );


        String sanitizedPlantUml =
                plantUmlSanitizer.sanitize(
                        request.plantUmlCode()
                );


        String svg =
                plantUmlRenderService.renderToSvg(
                        sanitizedPlantUml
                );


        String svgBase64 =
                Base64.getEncoder()
                        .encodeToString(
                                svg.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );


        int newVersion =
                diagram.getCurrentVersion() + 1;


        ClassDiagramVersion version =
                ClassDiagramVersion.builder()
                        .diagramId(diagramId)
                        .versionNumber(newVersion)
                        .plantUmlCode(
                                sanitizedPlantUml
                        )
                        .source(
                                DiagramSource.MANUAL
                        )
                        .build();


        versionRepository.save(version);


        diagram.setCurrentVersion(
                newVersion
        );

        diagram.setStatus(
                DiagramStatus.DRAFT
        );


        diagramRepository.save(diagram);


        return new UmlGenerationResponse(
                diagram.getId(),
                newVersion,
                sanitizedPlantUml,
                svgBase64
        );
    }


    // =========================================================
    // GET ALL VERSIONS
    // =========================================================

    public List<ClassDiagramVersion> findVersions(
            Long diagramId
    ) {

        if (diagramId == null) {
            throw new IllegalArgumentException(
                    "Diagram ID cannot be null."
            );
        }


        if (!diagramRepository.existsById(diagramId)) {

            throw new RuntimeException(
                    "UML diagram not found."
            );
        }


        return versionRepository
                .findByDiagramIdOrderByVersionNumberDesc(
                        diagramId
                );
    }


    // =========================================================
    // GET ALL DIAGRAMS FOR PROJECT
    // =========================================================

    public List<UmlDiagramSummaryResponse> findByProject(
            Long projectId
    ) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }


        return diagramRepository
                .findByProjectIdOrderByUpdatedAtDesc(
                        projectId
                )
                .stream()
                .map(
                        diagram ->
                                new UmlDiagramSummaryResponse(

                                        diagram.getId(),

                                        diagram.getProjectId(),

                                        diagram.getName(),

                                        diagram.getStatus(),

                                        diagram.getCurrentVersion(),

                                        diagram.getCreatedAt(),

                                        diagram.getUpdatedAt()
                                )
                )
                .toList();
    }


    // =========================================================
    // BUILD GEMINI PROMPT
    // =========================================================

    private String buildPrompt(
            UmlGenerationRequest request
    ) {

        StringBuilder prompt =
                new StringBuilder();


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


        prompt.append(
                        request.projectName()
                )
                .append("\n\n");


        prompt.append(
                "Requirements:\n"
        );


        for (
                RequirementForUml requirement :
                request.requirements()
        ) {

            prompt.append("\n");


            prompt.append(
                            "Requirement Code: "
                    )
                    .append(
                            requirement.code()
                    )
                    .append("\n");


            prompt.append(
                            "Title: "
                    )
                    .append(
                            requirement.title()
                    )
                    .append("\n");


            prompt.append(
                            "Description: "
                    )
                    .append(
                            requirement.description()
                    )
                    .append("\n");


            prompt.append(
                            "Type: "
                    )
                    .append(
                            requirement.type()
                    )
                    .append("\n");
        }


        prompt.append("""
                
                Generate the final PlantUML class diagram now.
                """);


        return prompt.toString();
    }
}