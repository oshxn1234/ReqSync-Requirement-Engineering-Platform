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
