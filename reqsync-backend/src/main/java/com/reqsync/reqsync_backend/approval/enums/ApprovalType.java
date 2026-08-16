package com.reqsync.reqsync_backend.approval.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ApprovalType {

    REQUIREMENT("Requirement"),

    BASELINE("Baseline"),

    CHANGE_REQUEST("Change Request");


    private final String displayName;


    ApprovalType(
            String displayName
    ) {

        this.displayName = displayName;
    }


    @JsonValue
    public String getDisplayName() {

        return displayName;
    }


    @JsonCreator
    public static ApprovalType fromValue(
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
                ApprovalType type
                : values()
        ) {

            if (
                    type.displayName
                            .equalsIgnoreCase(
                                    value.trim()
                            )
                            ||
                            type.name()
                                    .equalsIgnoreCase(
                                            value.trim()
                                    )
            ) {

                return type;
            }
        }


        throw new IllegalArgumentException(
                "Unknown approval type: "
                        + value
        );
    }
}
