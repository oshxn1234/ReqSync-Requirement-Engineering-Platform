package com.reqsync.reqsync_backend.auth.controller;

import com.reqsync.reqsync_backend.auth.dto.AuthResponse;
import com.reqsync.reqsync_backend.auth.dto.LoginRequest;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;
import com.reqsync.reqsync_backend.auth.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final JwtService jwtService;


    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService
    ) {

        this.authenticationManager =
                authenticationManager;

        this.userRepository =
                userRepository;

        this.jwtService =
                jwtService;
    }


    // ==========================================
    // Test
    // ==========================================

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "Authentication service is running!"
        );
    }


    // ==========================================
    // Login
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        // Validate request
        if (request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email and password are required."
                            )
                    );
        }


        try {

            // ==========================================
            // Authenticate user
            // ==========================================

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail(),
                                    request.getPassword()
                            )
                    );


            // ==========================================
            // Generate JWT
            // ==========================================

            UserDetails userDetails =
                    (UserDetails) authentication.getPrincipal();

            String token =
                    jwtService.generateToken(userDetails);


            // ==========================================
            // Find user
            // ==========================================

            User user =
                    userRepository
                            .findByEmailIgnoreCase(
                                    request.getEmail()
                            )
                            .orElseThrow();


            // ==========================================
            // Update login information
            // ==========================================

            user.setLastLoginAt(
                    LocalDateTime.now()
            );

            user.setFailedLoginAttempts(0);

            userRepository.save(user);


            // ==========================================
            // Return JWT + user information
            // ==========================================

            return ResponseEntity.ok(
                    AuthResponse.from(
                            user,
                            token,
                            "Login successful."
                    )
            );


        } catch (BadCredentialsException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password."
                            )
                    );
        }
    }


    // ==========================================
    // Current User
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Not authenticated."
                            )
                    );
        }


        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                authentication.getName()
                        )
                        .orElseThrow();


        return ResponseEntity.ok(
                AuthResponse.from(
                        user,
                        null,
                        "Authenticated user."
                )
        );
    }


    // ==========================================
    // Logout
    // ==========================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        /*
         * JWT authentication is stateless.
         *
         * There is no HTTP session to invalidate.
         * The frontend should remove the JWT token.
         */

        SecurityContextHolder.clearContext();


        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logout successful."
                )
        );
    }
}