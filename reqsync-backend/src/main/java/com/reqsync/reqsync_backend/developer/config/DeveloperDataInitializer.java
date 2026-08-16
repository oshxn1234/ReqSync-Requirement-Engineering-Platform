package com.reqsync.reqsync_backend.developer.config;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
public class DeveloperDataInitializer {


    // =====================================================
    // Initialize Developer Test User
    // =====================================================

    @Bean
    CommandLineRunner initializeDeveloperUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            System.out.println();
            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "     DEVELOPER DATABASE INITIALIZATION"
            );
            System.out.println(
                    "=============================================="
            );


            /*
             * Password used for development testing.
             *
             * It is encrypted using BCrypt before
             * being stored in PostgreSQL.
             */
            String password =
                    passwordEncoder.encode(
                            "password123"
                    );


            // =================================================
            // Developer Test User
            // =================================================

            createDeveloperUserIfNotExists(
                    userRepository,
                    password,
                    "john@reqsync.com",
                    "John",
                    "Doe"
            );


            System.out.println(
                    "Developer test users initialized successfully."
            );

            System.out.println(
                    "=============================================="
            );

            System.out.println();
        };
    }


    // =====================================================
    // Create Developer User
    // =====================================================

    private void createDeveloperUserIfNotExists(
            UserRepository repository,
            String encryptedPassword,
            String email,
            String firstName,
            String lastName
    ) {

        /*
         * Check whether the developer already exists.
         */

        if (
                repository.existsByEmailIgnoreCase(
                        email
                )
        ) {

            System.out.println(
                    "Developer user already exists: "
                            + email
            );

            return;
        }


        /*
         * Use the empty constructor instead of the
         * parameterized constructor.
         *
         * This avoids problems if the User constructor
         * contains additional fields such as Business.
         */

        User user = new User();


        user.setEmail(email);

        user.setPassword(encryptedPassword);

        user.setFirstName(firstName);

        user.setLastName(lastName);

        user.setRole(
                Role.DEVELOPER
        );

        user.setEnabled(true);

        user.setAccountLocked(false);

        user.setFailedLoginAttempts(0);


        /*
         * Save user into the Developer database.
         */

        repository.save(user);


        System.out.println(
                "Created developer test user: "
                        + email
                        + " | Role: "
                        + Role.DEVELOPER
        );
    }
}