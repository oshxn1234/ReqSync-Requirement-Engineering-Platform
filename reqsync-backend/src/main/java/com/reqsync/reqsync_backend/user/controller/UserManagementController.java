package com.reqsync.reqsync_backend.user.controller;

import com.reqsync.reqsync_backend.auth.entity.Role;

import com.reqsync.reqsync_backend.user.dto.EmployeeRegistrationRequest;
import com.reqsync.reqsync_backend.user.dto.UserResponse;

import com.reqsync.reqsync_backend.user.service.UserManagementService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserManagementService
            userManagementService;


    public UserManagementController(
            UserManagementService userManagementService
    ) {

        this.userManagementService =
                userManagementService;
    }


    // ==========================================
    // REGISTER EMPLOYEE
    // ==========================================

    /**
     * SYSTEM_ADMIN only.
     *
     * POST /api/users/employees
     */
    @PostMapping("/employees")
    @PreAuthorize(
            "hasRole('SYSTEM_ADMIN')"
    )
    public ResponseEntity<UserResponse>
    registerEmployee(
            @RequestBody
            EmployeeRegistrationRequest request,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userManagementService
                        .registerEmployee(
                                request,
                                authentication
                        )
        );
    }


    // ==========================================
    // GET EMPLOYEE POOL
    // ==========================================

    /**
     * GET /api/users/employees
     */
    @GetMapping("/employees")
    public ResponseEntity<List<UserResponse>>
    getEmployees(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userManagementService
                        .getBusinessEmployees(
                                authentication
                        )
        );
    }


    // ==========================================
    // GET EMPLOYEES BY ROLE
    // ==========================================

    /**
     * Examples:
     *
     * GET /api/users/employees/role/PROJECT_MANAGER
     * GET /api/users/employees/role/BUSINESS_ANALYST
     * GET /api/users/employees/role/DEVELOPER
     */
    @GetMapping(
            "/employees/role/{role}"
    )
    public ResponseEntity<List<UserResponse>>
    getEmployeesByRole(
            @PathVariable
            Role role,

            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userManagementService
                        .getEmployeesByRole(
                                role,
                                authentication
                        )
        );
    }
}