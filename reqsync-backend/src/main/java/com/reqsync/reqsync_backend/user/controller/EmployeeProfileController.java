package com.reqsync.reqsync_backend.user.controller;

import com.reqsync.reqsync_backend.user.dto.EmployeeProfileRequest;
import com.reqsync.reqsync_backend.user.dto.EmployeeProfileResponse;

import com.reqsync.reqsync_backend.user.service.EmployeeProfileService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(
        "/api/users/{userId}/profile"
)
public class EmployeeProfileController {

    private final EmployeeProfileService
            employeeProfileService;


    public EmployeeProfileController(
            EmployeeProfileService employeeProfileService
    ) {

        this.employeeProfileService =
                employeeProfileService;
    }


    // =========================================================
    // CREATE / UPDATE PROFILE
    // =========================================================

    /**
     * System Admin only.
     *
     * PUT
     * /api/users/12/profile
     */
    @PutMapping
    @PreAuthorize(
            "hasRole('SYSTEM_ADMIN')"
    )
    public ResponseEntity<EmployeeProfileResponse>
    saveProfile(
            @PathVariable
            Long userId,

            @RequestBody
            EmployeeProfileRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                employeeProfileService
                        .saveProfile(
                                userId,
                                request,
                                authentication
                        )
        );
    }


    // =========================================================
    // GET PROFILE
    // =========================================================

    /**
     * GET
     * /api/users/12/profile
     */
    @GetMapping
    public ResponseEntity<EmployeeProfileResponse>
    getProfile(
            @PathVariable
            Long userId,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                employeeProfileService
                        .getProfile(
                                userId,
                                authentication
                        )
        );
    }
}