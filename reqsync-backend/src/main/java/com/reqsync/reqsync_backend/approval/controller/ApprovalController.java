package com.reqsync.reqsync_backend.approval.controller;

import com.reqsync.reqsync_backend.approval.dto.ApprovalResponse;
import com.reqsync.reqsync_backend.approval.dto.CreateApprovalRequest;
import com.reqsync.reqsync_backend.approval.service.ApprovalService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalService
            approvalService;


    public ApprovalController(
            ApprovalService approvalService
    ) {

        this.approvalService =
                approvalService;
    }


    // ==========================================
    // GET PROJECT APPROVALS
    // ==========================================

    @GetMapping(
            "/project/{projectId}"
    )
    public ResponseEntity<List<ApprovalResponse>>
    getByProject(
            @PathVariable
            Long projectId
    ) {

        return ResponseEntity.ok(
                approvalService.getByProject(
                        projectId
                )
        );
    }


    // ==========================================
    // CREATE APPROVAL REQUEST
    // ==========================================

    @PostMapping
    public ResponseEntity<ApprovalResponse>
    create(
            @RequestBody
            CreateApprovalRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                approvalService.create(
                        request,
                        authentication
                )
        );
    }


    // ==========================================
    // APPROVE
    // ==========================================

    @PostMapping(
            "/{code}/approve"
    )
    public ResponseEntity<ApprovalResponse>
    approve(
            @PathVariable
            String code,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                approvalService.approve(
                        code,
                        authentication
                )
        );
    }


    // ==========================================
    // REJECT
    // ==========================================

    @PostMapping(
            "/{code}/reject"
    )
    public ResponseEntity<ApprovalResponse>
    reject(
            @PathVariable
            String code,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                approvalService.reject(
                        code,
                        authentication
                )
        );
    }
}
