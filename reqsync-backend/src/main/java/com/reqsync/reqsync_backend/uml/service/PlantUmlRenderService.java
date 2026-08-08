package com.reqsync.reqsync_backend.uml.service;

import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.SourceStringReader;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PlantUmlRenderService {

    public String renderToSvg(String plantUmlCode) {

        if (plantUmlCode == null || plantUmlCode.isBlank()) {
            throw new IllegalArgumentException(
                    "PlantUML code cannot be empty."
            );
        }

        try {

            SourceStringReader reader =
                    new SourceStringReader(plantUmlCode);

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            reader.generateImage(
                    outputStream,
                    new FileFormatOption(FileFormat.SVG)
            );

            return outputStream.toString(
                    StandardCharsets.UTF_8
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to render PlantUML diagram: "
                            + exception.getMessage(),
                    exception
            );
        }
    }
}