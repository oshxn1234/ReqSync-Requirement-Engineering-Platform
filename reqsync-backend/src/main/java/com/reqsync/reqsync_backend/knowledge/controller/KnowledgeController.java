package com.reqsync.reqsync_backend.knowledge.controller;

import com.reqsync.reqsync_backend.knowledge.dto.CreateKnowledgeItemRequest;
import com.reqsync.reqsync_backend.knowledge.dto.KnowledgeItemResponse;
import com.reqsync.reqsync_backend.knowledge.service.KnowledgeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService
            knowledgeService;


    public KnowledgeController(
            KnowledgeService knowledgeService
    ) {

        this.knowledgeService =
                knowledgeService;
    }


    // ==========================================
    // GET PROJECT KNOWLEDGE
    // ==========================================

    @GetMapping(
            "/project/{projectId}"
    )
    public ResponseEntity<List<KnowledgeItemResponse>>
    getProjectKnowledge(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                knowledgeService
                        .getProjectKnowledge(
                                projectId
                        )
        );
    }


    // ==========================================
    // CREATE KNOWLEDGE ITEM
    // ==========================================

    @PostMapping
    public ResponseEntity<KnowledgeItemResponse>
    createKnowledge(
            @RequestBody
            CreateKnowledgeItemRequest request
    ) {

        return ResponseEntity.ok(
                knowledgeService
                        .createKnowledge(
                                request
                        )
        );
    }
}
