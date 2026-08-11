package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.enums.RequirementPriority;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.enums.RequirementType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RequirementValidationService {

    /**
     * Validates a list of requirements returned by the AI.
     */
    public List<String> validate(
            List<ExtractedRequirementResponse> requirements
    ) {

        List<String> errors = new ArrayList<>();

        if (requirements == null || requirements.isEmpty()) {
            errors.add("No requirements were extracted.");
            return errors;
        }

        for (int i = 0; i < requirements.size(); i++) {

            ExtractedRequirementResponse requirement =
                    requirements.get(i);

            String prefix = "Requirement " + (i + 1) + ": ";

            if (requirement == null) {
                errors.add(prefix + "Requirement is null.");
                continue;
            }

            if (isBlank(requirement.getCode())) {
                errors.add(prefix + "Requirement code is missing.");
            }

            if (isBlank(requirement.getTitle())) {
                errors.add(prefix + "Requirement title is missing.");
            }

            if (isBlank(requirement.getDescription())) {
                errors.add(prefix + "Requirement description is missing.");
            }

            if (requirement.getType() == null) {
                errors.add(prefix + "Requirement type is missing.");
            }

            if (requirement.getPriority() == null) {
                errors.add(prefix + "Requirement priority is missing.");
            }

            if (requirement.getStatus() == null) {
                errors.add(prefix + "Requirement status is missing.");
            }

            if (requirement.getConfidenceScore() != null) {

                double confidence =
                        requirement.getConfidenceScore();

                if (confidence < 0 || confidence > 1) {
                    errors.add(
                            prefix +
                                    "Confidence score must be between 0 and 1."
                    );
                }
            }
        }

        return errors;
    }


    /**
     * Validates a single requirement.
     */
    public boolean isValid(
            ExtractedRequirementResponse requirement
    ) {

        if (requirement == null) {
            return false;
        }

        return !isBlank(requirement.getCode())
                && !isBlank(requirement.getTitle())
                && !isBlank(requirement.getDescription())
                && requirement.getType() != null
                && requirement.getPriority() != null
                && requirement.getStatus() != null;
    }


    /**
     * Makes sure AI does not return an empty string.
     */
    private boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}