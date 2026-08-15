package com.reqsync.reqsync_backend.auth.config;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            String password = passwordEncoder.encode("password123");

            // CEO
            createUserIfNotExists(
                    userRepository,
                    password,
                    "ceo@reqsync.com",
                    "Chief",
                    "Executive",
                    Role.CEO
            );

            // Project Manager
            createUserIfNotExists(
                    userRepository,
                    password,
                    "michael@reqsync.com",
                    "Michael",
                    "Brown",
                    Role.PROJECT_MANAGER
            );

            // Business Analyst
            createUserIfNotExists(
                    userRepository,
                    password,
                    "sarah@reqsync.com",
                    "Sarah",
                    "Johnson",
                    Role.BUSINESS_ANALYST
            );

            // Developer
            createUserIfNotExists(
                    userRepository,
                    password,
                    "john@reqsync.com",
                    "John",
                    "Doe",
                    Role.DEVELOPER
            );

            // QA Engineer
            createUserIfNotExists(
                    userRepository,
                    password,
                    "emily@reqsync.com",
                    "Emily",
                    "Davis",
                    Role.QA_ENGINEER
            );

            // Stakeholder
            createUserIfNotExists(
                    userRepository,
                    password,
                    "alice@reqsync.com",
                    "Alice",
                    "Smith",
                    Role.STAKEHOLDER
            );
        };
    }

    private void createUserIfNotExists(
            UserRepository repository,
            String password,
            String email,
            String firstName,
            String lastName,
            Role role
    ) {

        if (!repository.existsByEmailIgnoreCase(email)) {

            User user = new User(
                    email,
                    password,
                    firstName,
                    lastName,
                    role
            );

            repository.save(user);

            System.out.println(
                    "Created development user: "
                            + email
                            + " / "
                            + role
            );
        }
    }
}