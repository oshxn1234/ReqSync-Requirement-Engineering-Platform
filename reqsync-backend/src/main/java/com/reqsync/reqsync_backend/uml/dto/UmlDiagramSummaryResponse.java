package com.reqsync.reqsync_backend.uml.dto;

import com.reqsync.reqsync_backend.uml.enums.DiagramStatus;

import java.time.LocalDateTime;

public record UmlDiagramSummaryResponse(

        Long diagramId,
        Long projectId,
        String name,
        DiagramStatus status,
        Integer currentVersion,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}