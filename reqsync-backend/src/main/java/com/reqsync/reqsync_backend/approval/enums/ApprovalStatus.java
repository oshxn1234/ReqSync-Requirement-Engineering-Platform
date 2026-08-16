package com.reqsync.reqsync_backend.approval.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ApprovalStatus {

    PENDING("Pending"),

    APPROVED("Approved"),

    REJECTED("Rejected");


    private final String displayName;


    ApprovalStatus(
            String displayName
    ) {

        this.displayName = displayName;
    }


    @JsonValue
    public String getDisplayName() {

        return displayName;
    }


    @JsonCreator
    public static ApprovalStatus fromValue(
            String value
    ) {

        if (
                value == null
                        ||
                        value.isBlank()
        ) {

            return null;
        }


        for (
                ApprovalStatus status
                : values()
        ) {

            if (
                    status.displayName
                            .equalsIgnoreCase(
                                    value.trim()
                            )
                            ||
                            status.name()
                                    .equalsIgnoreCase(
                                            value.trim()
                                    )
            ) {

                return status;
            }
        }


        throw new IllegalArgumentException(
                "Unknown approval status: "
                        + value
        );
    }
}
