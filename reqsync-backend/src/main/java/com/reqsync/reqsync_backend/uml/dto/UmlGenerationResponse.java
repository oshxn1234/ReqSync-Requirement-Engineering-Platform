package com.reqsync.reqsync_backend.uml.dto;

public record UmlGenerationResponse(

        Long diagramId,

        Integer versionNumber,

        String plantUmlCode,

        String svgBase64

) {
}