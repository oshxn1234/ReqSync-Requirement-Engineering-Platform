package com.reqsync.reqsync_backend.knowledge.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum KnowledgeCategory {

    REQUIREMENTS("Requirements"),

    DECISIONS("Decisions"),

    LESSONS_LEARNED("Lessons Learned"),

    QA_FINDINGS("QA Findings"),

    TEMPLATES("Templates");


    private final String displayName;


    KnowledgeCategory(
            String displayName
    ) {

        this.displayName = displayName;
    }


    @JsonValue
    public String getDisplayName() {

        return displayName;
    }


    @JsonCreator
    public static KnowledgeCategory fromValue(
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
                KnowledgeCategory category
                : values()
        ) {

            if (
                    category.displayName
                            .equalsIgnoreCase(
                                    value.trim()
                            )
                            ||
                            category.name()
                                    .equalsIgnoreCase(
                                            value.trim()
                                    )
            ) {

                return category;
            }
        }


        throw new IllegalArgumentException(
                "Unknown knowledge category: "
                        + value
        );
    }
}
