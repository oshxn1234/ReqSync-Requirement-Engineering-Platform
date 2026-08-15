package com.reqsync.reqsync_backend.auth.config;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.business.entity.Business;
import com.reqsync.reqsync_backend.business.repository.BusinessRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            BusinessRepository businessRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // ==========================================
            // STEP 1
            // Create development business
            // ==========================================

            String registrationNumber =
                    "REQSYNC-DEV-001";


            Business business =
                    businessRepository
                            .findByRegistrationNumberIgnoreCase(
                                    registrationNumber
                            )
                            .orElseGet(
                                    () -> {

                                        Business newBusiness =
                                                new Business();

                                        newBusiness.setName(
                                                "ReqSync Development Company"
                                        );

                                        newBusiness.setRegistrationNumber(
                                                registrationNumber
                                        );

                                        newBusiness.setEmail(
                                                "info@reqsync.com"
                                        );

                                        newBusiness.setPhone(
                                                "+94770000000"
                                        );

                                        newBusiness.setAddress(
                                                "Colombo, Sri Lanka"
                                        );


                                        Business savedBusiness =
                                                businessRepository.save(
                                                        newBusiness
                                                );


                                        System.out.println(
                                                "Created development business: "
                                                        + savedBusiness.getName()
                                        );


                                        return savedBusiness;
                                    }
                            );


            // ==========================================
            // STEP 2
            // Encode common development password
            // ==========================================

            String password =
                    passwordEncoder.encode(
                            "password123"
                    );


            // ==========================================
            // STEP 3
            // CEO
            // ==========================================

            createUserIfNotExists(
                    userRepository,
                    business,
                    password,
                    "ceo@reqsync.com",
                    "Chief",
                    "Executive",
                    Role.CEO
            );


            // ==========================================
            // Project Manager
            // ==========================================

            createUserIfNotExists(
                    userRepository,
                    business,
                    password,
                    "michael@reqsync.com",
                    "Michael",
                    "Brown",
                    Role.PROJECT_MANAGER
            );


            // ==========================================
            // Business Analyst
            // ==========================================

            createUserIfNotExists(
                    userRepository,
                    business,
                    password,
                    "sarah@reqsync.com",
                    "Sarah",
                    "Johnson",
                    Role.BUSINESS_ANALYST
            );


            // ==========================================
            // Developer
            // ==========================================

            createUserIfNotExists(
                    userRepository,
                    business,
                    password,
                    "john@reqsync.com",
                    "John",
                    "Doe",
                    Role.DEVELOPER
            );


            // ==========================================
            // QA Engineer
            // ==========================================

            createUserIfNotExists(
                    userRepository,
                    business,
                    password,
                    "emily@reqsync.com",
                    "Emily",
                    "Davis",
                    Role.QA_ENGINEER
            );

        };
    }


    // ==========================================
    // CREATE USER IF NOT EXISTS
    // ==========================================

    private void createUserIfNotExists(
            UserRepository repository,
            Business business,
            String password,
            String email,
            String firstName,
            String lastName,
            Role role
    ) {

        if (
                !repository.existsByEmailIgnoreCase(
                        email
                )
        ) {

            User user =
                    new User(
                            business,
                            email,
                            password,
                            firstName,
                            lastName,
                            role
                    );


            repository.save(
                    user
            );


            System.out.println(
                    "Created development user: "
                            + email
                            + " / "
                            + role
                            + " / Business: "
                            + business.getName()
            );
        }
    }
}