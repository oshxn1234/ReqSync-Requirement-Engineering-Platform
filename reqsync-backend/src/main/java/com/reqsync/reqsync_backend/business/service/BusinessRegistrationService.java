package com.reqsync.reqsync_backend.business.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.business.dto.BusinessRegistrationRequest;
import com.reqsync.reqsync_backend.business.dto.BusinessRegistrationResponse;

import com.reqsync.reqsync_backend.business.entity.Business;
import com.reqsync.reqsync_backend.business.repository.BusinessRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BusinessRegistrationService {

    private final BusinessRepository
            businessRepository;

    private final UserRepository
            userRepository;

    private final PasswordEncoder
            passwordEncoder;


    public BusinessRegistrationService(
            BusinessRepository businessRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.businessRepository =
                businessRepository;

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    // ==========================================
    // REGISTER BUSINESS
    // ==========================================

    public BusinessRegistrationResponse register(
            BusinessRegistrationRequest request
    ) {

        validateRequest(
                request
        );


        // ------------------------------------------
        // Check registration number
        // ------------------------------------------

        if (
                businessRepository
                        .existsByRegistrationNumberIgnoreCase(
                                request.getRegistrationNumber()
                                        .trim()
                        )
        ) {

            throw new RuntimeException(
                    "A business with this registration number already exists."
            );
        }


        // ------------------------------------------
        // Check CEO email
        // ------------------------------------------

        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                request.getCeoEmail()
                                        .trim()
                        )
        ) {

            throw new RuntimeException(
                    "CEO email is already registered."
            );
        }


        // ------------------------------------------
        // Check Admin email
        // ------------------------------------------

        if (
                userRepository
                        .existsByEmailIgnoreCase(
                                request.getAdminEmail()
                                        .trim()
                        )
        ) {

            throw new RuntimeException(
                    "System Admin email is already registered."
            );
        }


        if (
                request.getCeoEmail()
                        .trim()
                        .equalsIgnoreCase(
                                request.getAdminEmail()
                                        .trim()
                        )
        ) {

            throw new RuntimeException(
                    "CEO and System Admin must use different email addresses."
            );
        }


        // ==========================================
        // Create Business
        // ==========================================

        Business business =
                new Business();

        business.setName(
                request.getBusinessName()
                        .trim()
        );

        business.setRegistrationNumber(
                request.getRegistrationNumber()
                        .trim()
        );

        business.setEmail(
                request.getBusinessEmail()
        );

        business.setPhone(
                request.getBusinessPhone()
        );

        business.setAddress(
                request.getBusinessAddress()
        );


        Business savedBusiness =
                businessRepository.save(
                        business
                );


        // ==========================================
        // Create CEO
        // ==========================================

        User ceo =
                new User();

        ceo.setBusiness(
                savedBusiness
        );

        ceo.setFirstName(
                request.getCeoFirstName()
                        .trim()
        );

        ceo.setLastName(
                request.getCeoLastName()
                        .trim()
        );

        ceo.setEmail(
                request.getCeoEmail()
                        .trim()
                        .toLowerCase()
        );

        ceo.setPassword(
                passwordEncoder.encode(
                        request.getCeoPassword()
                )
        );

        ceo.setRole(
                Role.CEO
        );

        ceo.setEnabled(
                true
        );

        ceo.setAccountLocked(
                false
        );

        ceo.setFailedLoginAttempts(
                0
        );


        User savedCeo =
                userRepository.save(
                        ceo
                );


        // ==========================================
        // Create System Admin
        // ==========================================

        User systemAdmin =
                new User();

        systemAdmin.setBusiness(
                savedBusiness
        );

        systemAdmin.setFirstName(
                request.getAdminFirstName()
                        .trim()
        );

        systemAdmin.setLastName(
                request.getAdminLastName()
                        .trim()
        );

        systemAdmin.setEmail(
                request.getAdminEmail()
                        .trim()
                        .toLowerCase()
        );

        systemAdmin.setPassword(
                passwordEncoder.encode(
                        request.getAdminPassword()
                )
        );

        systemAdmin.setRole(
                Role.SYSTEM_ADMIN
        );

        systemAdmin.setEnabled(
                true
        );

        systemAdmin.setAccountLocked(
                false
        );

        systemAdmin.setFailedLoginAttempts(
                0
        );


        User savedAdmin =
                userRepository.save(
                        systemAdmin
                );


        // ==========================================
        // Response
        // ==========================================

        return new BusinessRegistrationResponse(
                savedBusiness.getId(),
                savedBusiness.getName(),
                savedCeo.getId(),
                savedCeo.getEmail(),
                savedAdmin.getId(),
                savedAdmin.getEmail(),
                "Business, CEO and System Admin registered successfully."
        );
    }


    // ==========================================
    // Validation
    // ==========================================

    private void validateRequest(
            BusinessRegistrationRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Business registration request cannot be null."
            );
        }


        if (
                request.getBusinessName() == null
                        ||
                        request.getBusinessName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Business name is required."
            );
        }


        if (
                request.getRegistrationNumber() == null
                        ||
                        request.getRegistrationNumber().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Registration number is required."
            );
        }


        if (
                request.getCeoFirstName() == null
                        ||
                        request.getCeoFirstName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "CEO first name is required."
            );
        }


        if (
                request.getCeoLastName() == null
                        ||
                        request.getCeoLastName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "CEO last name is required."
            );
        }


        if (
                request.getCeoEmail() == null
                        ||
                        request.getCeoEmail().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "CEO email is required."
            );
        }


        if (
                request.getCeoPassword() == null
                        ||
                        request.getCeoPassword().length() < 8
        ) {

            throw new IllegalArgumentException(
                    "CEO password must contain at least 8 characters."
            );
        }


        if (
                request.getAdminFirstName() == null
                        ||
                        request.getAdminFirstName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "System Admin first name is required."
            );
        }


        if (
                request.getAdminLastName() == null
                        ||
                        request.getAdminLastName().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "System Admin last name is required."
            );
        }


        if (
                request.getAdminEmail() == null
                        ||
                        request.getAdminEmail().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "System Admin email is required."
            );
        }


        if (
                request.getAdminPassword() == null
                        ||
                        request.getAdminPassword().length() < 8
        ) {

            throw new IllegalArgumentException(
                    "System Admin password must contain at least 8 characters."
            );
        }
    }
}