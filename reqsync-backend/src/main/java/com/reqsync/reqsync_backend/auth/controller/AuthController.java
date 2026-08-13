package com.reqsync.reqsync_backend.auth.controller;

import com.reqsync.reqsync_backend.auth.dto.AuthResponse;
import com.reqsync.reqsync_backend.auth.dto.LoginRequest;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();


    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository
    ) {

        this.authenticationManager =
                authenticationManager;

        this.userRepository =
                userRepository;
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
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

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

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getEmail(),
                                    request.getPassword()
                            )
                    );


            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(
                    authentication
            );

            SecurityContextHolder.setContext(
                    context
            );


            securityContextRepository.saveContext(
                    context,
                    httpRequest,
                    httpResponse
            );


            User user =
                    userRepository
                            .findByEmailIgnoreCase(
                                    request.getEmail()
                            )
                            .orElseThrow();


            user.setLastLoginAt(
                    LocalDateTime.now()
            );

            user.setFailedLoginAttempts(0);

            userRepository.save(user);


            return ResponseEntity.ok(
                    AuthResponse.from(
                            user,
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
    // Current user
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
                        "Authenticated user."
                )
        );
    }


    // ==========================================
    // Logout
    // ==========================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {

        SecurityContextHolder.clearContext();

        if (request.getSession(false) != null) {

            request.getSession(false).invalidate();
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logout successful."
                )
        );
    }
}