package com.reqsync.reqsync_backend.requirement.dto;

public class SimilarRequirementResponse {

    private Long id;
    private String code;
    private String title;
    private String description;
    private double similarity;

    public SimilarRequirementResponse(
            Long id,
            String code,
            String title,
            String description,
            double similarity
    ) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.similarity = similarity;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public double getSimilarity() {
        return similarity;
    }
}