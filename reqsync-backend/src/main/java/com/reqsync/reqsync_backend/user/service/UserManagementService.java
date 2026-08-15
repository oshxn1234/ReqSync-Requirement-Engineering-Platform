package com.reqsync.reqsync_backend.user.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.user.dto.EmployeeRegistrationRequest;
import com.reqsync.reqsync_backend.user.dto.UserResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserManagementService {

    private final UserRepository
            userRepository;

    private final PasswordEncoder
            passwordEncoder;


    public UserManagementService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    // ==========================================
    // REGISTER EMPLOYEE
    // ==========================================

    public UserResponse registerEmployee(
            EmployeeRegistrationRequest request,
            Authentication authentication
    ) {

        validateEmployeeRequest(
                request
        );


        User systemAdmin =
                getAuthenticatedUser(
                        authentication
                );


        if (
                systemAdmin.getRole()
                        != Role.SYSTEM_ADMIN
        ) {

            throw new RuntimeException(
                    "Only System Administrators can register employees."
            );
        }


        validateRegisterableRole(
                request.getRole()
        );


        String email =
                request
                        .getEmail()
                        .trim()
                        .toLowerCase();


        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                email
                        )
        ) {

            throw new RuntimeException(
                    "A user with this email already exists."
            );
        }


        User employee =
                new User();

        /*
         * Critical:
         * employee belongs automatically
         * to System Admin's business.
         */
        employee.setBusiness(
                systemAdmin.getBusiness()
        );


        employee.setFirstName(
                request.getFirstName()
                        .trim()
        );


        employee.setLastName(
                request.getLastName()
                        .trim()
        );


        employee.setEmail(
                email
        );


        employee.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        employee.setRole(
                request.getRole()
        );


        employee.setEnabled(
                true
        );


        employee.setAccountLocked(
                false
        );


        employee.setFailedLoginAttempts(
                0
        );


        User savedEmployee =
                userRepository.save(
                        employee
                );


        return toResponse(
                savedEmployee
        );
    }


    // ==========================================
    // GET ALL BUSINESS EMPLOYEES
    // ==========================================

    @Transactional(readOnly = true)
    public List<UserResponse> getBusinessEmployees(
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        return userRepository
                .findByBusinessId(
                        currentUser
                                .getBusiness()
                                .getId()
                )
                .stream()

                /*
                 * We don't return CEO/Admin
                 * as normal project employees.
                 */
                .filter(
                        user ->
                                user.getRole()
                                        != Role.CEO
                )
                .filter(
                        user ->
                                user.getRole()
                                        != Role.SYSTEM_ADMIN
                )
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // GET BY ROLE
    // ==========================================

    @Transactional(readOnly = true)
    public List<UserResponse> getEmployeesByRole(
            Role role,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        validateRegisterableRole(
                role
        );


        return userRepository
                .findByBusinessIdAndRole(
                        currentUser
                                .getBusiness()
                                .getId(),
                        role
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                        authentication.getName() == null
                        ||
                        authentication.getName().isBlank()
        ) {

            throw new RuntimeException(
                    "Authenticated user could not be determined."
            );
        }


        return userRepository
                .findByEmailIgnoreCase(
                        authentication.getName()
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Authenticated user was not found."
                                )
                );
    }


    // ==========================================
    // ROLE VALIDATION
    // ==========================================

    private void validateRegisterableRole(
            Role role
    ) {

        if (role == null) {

            throw new IllegalArgumentException(
                    "Employee role is required."
            );
        }


        /*
         * System Admin may create these accounts.
         *
         * NOT CEO.
         * NOT SYSTEM_ADMIN.
         */
        if (
                role != Role.PROJECT_MANAGER
                        &&
                        role != Role.BUSINESS_ANALYST
                        &&
                        role != Role.DEVELOPER
                        &&
                        role != Role.QA_ENGINEER
        ) {

            throw new IllegalArgumentException(
                    "System Admin can only register "
                            + "PROJECT_MANAGER, BUSINESS_ANALYST, "
                            + "DEVELOPER or QA_ENGINEER users."
            );
        }
    }


    // ==========================================
    // REQUEST VALIDATION
    // ==========================================

    private void validateEmployeeRequest(
            EmployeeRegistrationRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Employee registration request cannot be null."
            );
        }


        if (
                request.getFirstName() == null
                        ||
                        request.getFirstName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "First name is required."
            );
        }


        if (
                request.getLastName() == null
                        ||
                        request.getLastName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Last name is required."
            );
        }


        if (
                request.getEmail() == null
                        ||
                        request.getEmail().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Email is required."
            );
        }


        if (
                request.getPassword() == null
                        ||
                        request.getPassword().length() < 8
        ) {

            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }
    }


    // ==========================================
    // RESPONSE
    // ==========================================

    private UserResponse toResponse(
            User user
    ) {

        return new UserResponse(
                user.getId(),
                user.getBusiness().getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.isAccountLocked(),
                user.getCreatedAt()
        );
    }
}