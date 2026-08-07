package com.reqsync.reqsync_backend.uml.controller;

import com.reqsync.reqsync_backend.uml.enums.DiagramStatus;

import java.time.LocalDateTime;

public record UmlDiagramSummaryResponse(

        Long diagramId,

        Long projectId,

        String diagramName,

        DiagramStatus status,

        Integer currentVersion,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

)
