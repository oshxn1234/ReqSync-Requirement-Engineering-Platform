package com.reqsync.reqsync_backend.uml.service;

import org.springframework.stereotype.Service;

@Service
public class PlantUmlSanitizer {

    public String sanitize(String plantUmlCode) {

        if (plantUmlCode == null || plantUmlCode.isBlank()) {
            throw new IllegalArgumentException(
                    "PlantUML code cannot be empty."
            );
        }

        String code = plantUmlCode.trim();

        // Remove Markdown code fences
        code = code.replace("```plantuml", "");
        code = code.replace("```PlantUML", "");
        code = code.replace("```", "");

        code = code.trim();

        // If Gemini did not include @startuml/@enduml,
        // add them automatically.
        if (!code.toLowerCase().contains("@startuml")) {
            code = "@startuml\n" + code;
        }

        if (!code.toLowerCase().contains("@enduml")) {
            code = code + "\n@enduml";
        }

        // Normalize line endings
        code = code.replace("\r\n", "\n");
        code = code.replace("\r", "\n");

        // Make sure @startuml is at the beginning
        int startIndex = code.toLowerCase().indexOf("@startuml");

        if (startIndex > 0) {
            code = code.substring(startIndex);
        }

        // Remove anything after @enduml
        int endIndex = code.toLowerCase().indexOf("@enduml");

        if (endIndex != -1) {
            code = code.substring(0, endIndex + "@enduml".length());
        }

        validate(code);

        return code.trim();
    }

    private void validate(String code) {

        String lowerCode = code.toLowerCase();

        if (!lowerCode.startsWith("@startuml")) {
            throw new IllegalArgumentException(
                    "PlantUML diagram must start with @startuml."
            );
        }

        if (!lowerCode.endsWith("@enduml")) {
            throw new IllegalArgumentException(
                    "PlantUML diagram must end with @enduml."
            );
        }

        if (code.length() > 100_000) {
            throw new IllegalArgumentException(
                    "PlantUML code is too large."
            );
        }
    }
}