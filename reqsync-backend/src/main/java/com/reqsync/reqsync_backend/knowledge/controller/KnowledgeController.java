package com.reqsync.reqsync_backend.knowledge.controller;

import com.reqsync.reqsync_backend.knowledge.dto.CreateKnowledgeItemRequest;
import com.reqsync.reqsync_backend.knowledge.dto.KnowledgeItemResponse;
import com.reqsync.reqsync_backend.knowledge.service.KnowledgeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    /*
     * =================================================================
     * KNOWLEDGE VAULT ENDPOINTS
     * =================================================================
     *
     *  GET  /api/knowledge
     *     Returns the full knowledge vault for the authenticated
     *     user's business. NOT scoped to a single project: it
     *     aggregates reusable data from ALL completed projects
     *     plus shared general resources.
     *
     *  POST /api/knowledge
     *     Adds a new vault item. If the item references a project,
     *     that project must already be COMPLETED.
     *
     * Both endpoints require a valid JWT.
     * =================================================================
     */

    private final KnowledgeService
            knowledgeService;


    public KnowledgeController(
            KnowledgeService knowledgeService
    ) {

        this.knowledgeService =
                knowledgeService;
    }


    // ==========================================
    // GET KNOWLEDGE VAULT
    // ==========================================

    @GetMapping
    public ResponseEntity<List<KnowledgeItemResponse>>
    getKnowledgeVault(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                knowledgeService
                        .getKnowledgeVault(
                                authentication
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
            CreateKnowledgeItemRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                knowledgeService
                        .createKnowledge(
                                request,
                                authentication
                        )
        );
    }
}
