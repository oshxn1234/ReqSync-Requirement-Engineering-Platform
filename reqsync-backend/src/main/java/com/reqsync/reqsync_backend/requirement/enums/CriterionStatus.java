package com.reqsync.reqsync_backend.requirement.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CriterionStatus {

    PASS,
    FAIL,
    PARTIAL;

    @JsonCreator
    public static CriterionStatus fromValue(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String normalized =
                value
                        .trim()
                        .toUpperCase();

        if (
                normalized.equals("PASS")
                        ||
                        normalized.equals("PASSED")
        ) {
            return PASS;
        }

        if (
                normalized.equals("FAIL")
                        ||
                        normalized.equals("FAILED")
        ) {
            return FAIL;
        }

        if (
                normalized.equals("PARTIAL")
                        ||
                        normalized.equals("PARTIALLY")
                        ||
                        normalized.equals("PARTIALS")
        ) {
            return PARTIAL;
        }

        throw new IllegalArgumentException(
                "Unknown CriterionStatus value: "
                        + value
        );
    }
}