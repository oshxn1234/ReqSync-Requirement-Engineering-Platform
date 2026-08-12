package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import org.springframework.stereotype.Service;

@Service
public class RequirementCodeService {

    private final RequirementRepository
            requirementRepository;


    public RequirementCodeService(
            RequirementRepository requirementRepository
    ) {

        this.requirementRepository =
                requirementRepository;
    }


    /**
     * Get the next number that should be used
     * for a requirement in the project.
     *
     * Example:
     *
     * Existing:
     * REQ-001
     * REQ-002
     * REQ-003
     *
     * Returns:
     * 4
     */
    public int getNextRequirementNumber(
            Long projectId
    ) {

        Integer maximumNumber =
                requirementRepository
                        .findMaximumRequirementNumber(
                                projectId
                        );


        if (maximumNumber == null) {

            return 1;
        }


        return maximumNumber + 1;
    }


    /**
     * Convert a number into a requirement code.
     *
     * 1   -> REQ-001
     * 9   -> REQ-009
     * 25  -> REQ-025
     * 105 -> REQ-105
     */
    public String generateCode(
            int requirementNumber
    ) {

        return String.format(
                "REQ-%03d",
                requirementNumber
        );
    }
}