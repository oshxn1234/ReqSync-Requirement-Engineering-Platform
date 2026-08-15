package com.reqsync.reqsync_backend.team.dto;

public class TechnicalRequirementMatchResponse {

    private Long newRequirementId;

    private String newRequirementCode;

    private String newRequirementTitle;

    private Long historicalRequirementId;

    private String historicalRequirementCode;

    private String historicalRequirementTitle;

    private Long historicalProjectId;

    private String historicalProjectName;

    private double similarity;


    public TechnicalRequirementMatchResponse() {
    }


    public TechnicalRequirementMatchResponse(
            Long newRequirementId,
            String newRequirementCode,
            String newRequirementTitle,
            Long historicalRequirementId,
            String historicalRequirementCode,
            String historicalRequirementTitle,
            Long historicalProjectId,
            String historicalProjectName,
            double similarity
    ) {

        this.newRequirementId =
                newRequirementId;

        this.newRequirementCode =
                newRequirementCode;

        this.newRequirementTitle =
                newRequirementTitle;

        this.historicalRequirementId =
                historicalRequirementId;

        this.historicalRequirementCode =
                historicalRequirementCode;

        this.historicalRequirementTitle =
                historicalRequirementTitle;

        this.historicalProjectId =
                historicalProjectId;

        this.historicalProjectName =
                historicalProjectName;

        this.similarity =
                similarity;
    }


    public Long getNewRequirementId() {
        return newRequirementId;
    }

    public void setNewRequirementId(
            Long newRequirementId
    ) {
        this.newRequirementId =
                newRequirementId;
    }


    public String getNewRequirementCode() {
        return newRequirementCode;
    }

    public void setNewRequirementCode(
            String newRequirementCode
    ) {
        this.newRequirementCode =
                newRequirementCode;
    }


    public String getNewRequirementTitle() {
        return newRequirementTitle;
    }

    public void setNewRequirementTitle(
            String newRequirementTitle
    ) {
        this.newRequirementTitle =
                newRequirementTitle;
    }


    public Long getHistoricalRequirementId() {
        return historicalRequirementId;
    }

    public void setHistoricalRequirementId(
            Long historicalRequirementId
    ) {
        this.historicalRequirementId =
                historicalRequirementId;
    }


    public String getHistoricalRequirementCode() {
        return historicalRequirementCode;
    }

    public void setHistoricalRequirementCode(
            String historicalRequirementCode
    ) {
        this.historicalRequirementCode =
                historicalRequirementCode;
    }


    public String getHistoricalRequirementTitle() {
        return historicalRequirementTitle;
    }

    public void setHistoricalRequirementTitle(
            String historicalRequirementTitle
    ) {
        this.historicalRequirementTitle =
                historicalRequirementTitle;
    }


    public Long getHistoricalProjectId() {
        return historicalProjectId;
    }

    public void setHistoricalProjectId(
            Long historicalProjectId
    ) {
        this.historicalProjectId =
                historicalProjectId;
    }


    public String getHistoricalProjectName() {
        return historicalProjectName;
    }

    public void setHistoricalProjectName(
            String historicalProjectName
    ) {
        this.historicalProjectName =
                historicalProjectName;
    }


    public double getSimilarity() {
        return similarity;
    }

    public void setSimilarity(
            double similarity
    ) {
        this.similarity =
                similarity;
    }
}