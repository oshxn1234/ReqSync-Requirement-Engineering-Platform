package com.reqsync.reqsync_backend.user.service;

import com.reqsync.reqsync_backend.auth.entity.Role;
import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import com.reqsync.reqsync_backend.user.dto.EmployeeProfileRequest;
import com.reqsync.reqsync_backend.user.dto.EmployeeProfileResponse;
import com.reqsync.reqsync_backend.user.dto.EmployeeSkillRequest;
import com.reqsync.reqsync_backend.user.dto.EmployeeSkillResponse;

import com.reqsync.reqsync_backend.user.entity.EmployeeProfile;
import com.reqsync.reqsync_backend.user.entity.EmployeeSkill;

import com.reqsync.reqsync_backend.user.repository.EmployeeProfileRepository;
import com.reqsync.reqsync_backend.user.repository.EmployeeSkillRepository;

import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class EmployeeProfileService {

    private final UserRepository
            userRepository;

    private final EmployeeProfileRepository
            employeeProfileRepository;

    private final EmployeeSkillRepository
            employeeSkillRepository;


    public EmployeeProfileService(
            UserRepository userRepository,
            EmployeeProfileRepository employeeProfileRepository,
            EmployeeSkillRepository employeeSkillRepository
    ) {

        this.userRepository =
                userRepository;

        this.employeeProfileRepository =
                employeeProfileRepository;

        this.employeeSkillRepository =
                employeeSkillRepository;
    }


    // =========================================================
    // CREATE / UPDATE PROFILE
    // =========================================================

    public EmployeeProfileResponse
    saveProfile(
            Long userId,
            EmployeeProfileRequest request,
            Authentication authentication
    ) {

        User systemAdmin =
                getAuthenticatedUser(
                        authentication
                );


        if (
                systemAdmin.getRole()
                        != Role.SYSTEM_ADMIN
        ) {

            throw new RuntimeException(
                    "Only System Administrators can manage employee profiles."
            );
        }


        validateRequest(
                request
        );


        User employee =
                userRepository
                        .findByIdAndBusinessId(
                                userId,
                                systemAdmin
                                        .getBusiness()
                                        .getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Employee not found or does not belong to your business."
                                        )
                        );


        validateEmployeeRole(
                employee.getRole()
        );


        EmployeeProfile profile =
                employeeProfileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseGet(
                                EmployeeProfile::new
                        );


        profile.setUser(
                employee
        );


        profile.setYearsOfExperience(
                request.getYearsOfExperience()
        );


        profile.setExperienceLevel(
                request.getExperienceLevel()
        );


        profile.setAvailabilityStatus(
                request.getAvailabilityStatus()
        );


        profile.setCurrentWorkloadPercentage(
                request.getCurrentWorkloadPercentage()
        );


        EmployeeProfile savedProfile =
                employeeProfileRepository
                        .save(
                                profile
                        );


        /*
         * Replace old skill list.
         *
         * This makes PUT semantics simple:
         * supplied list becomes the new profile.
         */
        employeeSkillRepository
                .deleteByEmployeeProfileId(
                        savedProfile.getId()
                );


        List<EmployeeSkill> savedSkills =
                new ArrayList<>();


        if (
                request.getSkills()
                        != null
        ) {

            for (
                    EmployeeSkillRequest skillRequest
                    : request.getSkills()
            ) {

                if (
                        skillRequest == null
                ) {

                    continue;
                }


                if (
                        skillRequest.getSkillName()
                                == null
                                ||
                                skillRequest.getSkillName()
                                        .isBlank()
                ) {

                    continue;
                }


                if (
                        skillRequest.getProficiency()
                                == null
                ) {

                    throw new IllegalArgumentException(
                            "Skill proficiency is required for skill: "
                                    + skillRequest.getSkillName()
                    );
                }


                EmployeeSkill skill =
                        new EmployeeSkill();


                skill.setEmployeeProfile(
                        savedProfile
                );


                skill.setSkillName(
                        skillRequest
                                .getSkillName()
                                .trim()
                );


                skill.setProficiency(
                        skillRequest
                                .getProficiency()
                );


                savedSkills.add(
                        employeeSkillRepository
                                .save(
                                        skill
                                )
                );
            }
        }


        return toResponse(
                savedProfile,
                savedSkills
        );
    }


    // =========================================================
    // GET ONE EMPLOYEE PROFILE
    // =========================================================

    @Transactional(readOnly = true)
    public EmployeeProfileResponse
    getProfile(
            Long userId,
            Authentication authentication
    ) {

        User currentUser =
                getAuthenticatedUser(
                        authentication
                );


        User employee =
                userRepository
                        .findByIdAndBusinessId(
                                userId,
                                currentUser
                                        .getBusiness()
                                        .getId()
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Employee not found or does not belong to your business."
                                        )
                        );


        EmployeeProfile profile =
                employeeProfileRepository
                        .findByUserId(
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Employee profile has not been created."
                                        )
                        );


        List<EmployeeSkill> skills =
                employeeSkillRepository
                        .findByEmployeeProfileId(
                                profile.getId()
                        );


        return toResponse(
                profile,
                skills
        );
    }


    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    private void validateRequest(
            EmployeeProfileRequest request
    ) {

        if (
                request == null
        ) {

            throw new IllegalArgumentException(
                    "Employee profile request cannot be null."
            );
        }


        if (
                request.getYearsOfExperience()
                        == null
                        ||
                        request.getYearsOfExperience()
                                < 0
        ) {

            throw new IllegalArgumentException(
                    "Years of experience must be zero or greater."
            );
        }


        if (
                request.getExperienceLevel()
                        == null
        ) {

            throw new IllegalArgumentException(
                    "Experience level is required."
            );
        }


        if (
                request.getAvailabilityStatus()
                        == null
        ) {

            throw new IllegalArgumentException(
                    "Availability status is required."
            );
        }


        if (
                request.getCurrentWorkloadPercentage()
                        == null
                        ||
                        request.getCurrentWorkloadPercentage()
                                < 0
                        ||
                        request.getCurrentWorkloadPercentage()
                                > 100
        ) {

            throw new IllegalArgumentException(
                    "Current workload percentage must be between 0 and 100."
            );
        }
    }


    // =========================================================
    // VALID EMPLOYEE ROLE
    // =========================================================

    private void validateEmployeeRole(
            Role role
    ) {

        if (
                role != Role.PROJECT_MANAGER
                        &&
                        role != Role.BUSINESS_ANALYST
                        &&
                        role != Role.DEVELOPER
                        &&
                        role != Role.QA_ENGINEER
        ) {

            throw new RuntimeException(
                    "Profiles can only be created for employees."
            );
        }
    }


    // =========================================================
    // AUTH USER
    // =========================================================

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
                                        "Authenticated user not found."
                                )
                );
    }


    // =========================================================
    // RESPONSE
    // =========================================================

    private EmployeeProfileResponse
    toResponse(
            EmployeeProfile profile,
            List<EmployeeSkill> skills
    ) {

        User user =
                profile.getUser();


        List<EmployeeSkillResponse>
                skillResponses =
                skills
                        .stream()
                        .map(
                                skill ->
                                        new EmployeeSkillResponse(
                                                skill.getId(),
                                                skill.getSkillName(),
                                                skill.getProficiency()
                                        )
                        )
                        .toList();


        return new EmployeeProfileResponse(
                profile.getId(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                profile.getYearsOfExperience(),
                profile.getExperienceLevel(),
                profile.getAvailabilityStatus(),
                profile.getCurrentWorkloadPercentage(),
                skillResponses
        );
    }
}