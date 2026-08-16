package com.reqsync.reqsync_backend.user.controller;

import com.reqsync.reqsync_backend.auth.entity.Role;

import com.reqsync.reqsync_backend.user.dto.EmployeeRegistrationRequest;
import com.reqsync.reqsync_backend.user.dto.UserResponse;

import com.reqsync.reqsync_backend.user.service.UserManagementService;

import org.springframework.http.ResponseEntity;
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


    // =========================================================
    // REGISTER EMPLOYEE
    // =========================================================

    /**
     * Register an employee.
     *
     * Authentication is required by SecurityConfig.
     *
     * UserManagementService additionally verifies
     * that the authenticated database user has
     * the SYSTEM_ADMIN role.
     *
     * POST /api/users/employees
     */
    @PostMapping("/employees")
    public ResponseEntity<UserResponse>
    registerEmployee(
            @RequestBody
            EmployeeRegistrationRequest request,

            Authentication authentication
    ) {

        UserResponse response =
                userManagementService
                        .registerEmployee(
                                request,
                                authentication
                        );


        return ResponseEntity.ok(
                response
        );
    }


    // =========================================================
    // GET EMPLOYEE POOL
    // =========================================================

    /**
     * Get all normal employees belonging
     * to the authenticated user's business.
     *
     * GET /api/users/employees
     */
    @GetMapping("/employees")
    public ResponseEntity<List<UserResponse>>
    getEmployees(
            Authentication authentication
    ) {

        List<UserResponse> employees =
                userManagementService
                        .getBusinessEmployees(
                                authentication
                        );


        return ResponseEntity.ok(
                employees
        );
    }


    // =========================================================
    // GET EMPLOYEES BY ROLE
    // =========================================================

    /**
     * Examples:
     *
     * GET /api/users/employees/role/PROJECT_MANAGER
     * GET /api/users/employees/role/BUSINESS_ANALYST
     * GET /api/users/employees/role/DEVELOPER
     * GET /api/users/employees/role/QA_ENGINEER
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

        List<UserResponse> employees =
                userManagementService
                        .getEmployeesByRole(
                                role,
                                authentication
                        );


        return ResponseEntity.ok(
                employees
        );
    }
}