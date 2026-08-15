package com.reqsync.reqsync_backend.team.dto;

import java.util.List;

public class BASuitabilityResponse {

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    /**
     * Final suitability from 0 - 100.
     */
    private Double suitabilityScore;


    /**
     * HIGH
     * MEDIUM
     * LOW
     */
    private String confidence;


    /**
     * Number of completed historical projects.
     */
    private Integer historicalProjectCount;


    /**
     * True when we had past-project evidence.
     */
    private boolean historyAvailable;


    private String reason;


    private List<PastProjectMatchResponse>
            pastProjectMatches;


    public BASuitabilityResponse() {
    }


    public BASuitabilityResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            Double suitabilityScore,
            String confidence,
            Integer historicalProjectCount,
            boolean historyAvailable,
            String reason,
            List<PastProjectMatchResponse>
                    pastProjectMatches
    ) {

        this.userId =
                userId;

        this.firstName =
                firstName;

        this.lastName =
                lastName;

        this.email =
                email;

        this.suitabilityScore =
                suitabilityScore;

        this.confidence =
                confidence;

        this.historicalProjectCount =
                historicalProjectCount;

        this.historyAvailable =
                historyAvailable;

        this.reason =
                reason;

        this.pastProjectMatches =
                pastProjectMatches;
    }


    public Long getUserId() {
        return userId;
    }


    public void setUserId(
            Long userId
    ) {
        this.userId =
                userId;
    }


    public String getFirstName() {
        return firstName;
    }


    public void setFirstName(
            String firstName
    ) {
        this.firstName =
                firstName;
    }


    public String getLastName() {
        return lastName;
    }


    public void setLastName(
            String lastName
    ) {
        this.lastName =
                lastName;
    }


    public String getEmail() {
        return email;
    }


    public void setEmail(
            String email
    ) {
        this.email =
                email;
    }


    public Double getSuitabilityScore() {
        return suitabilityScore;
    }


    public void setSuitabilityScore(
            Double suitabilityScore
    ) {
        this.suitabilityScore =
                suitabilityScore;
    }


    public String getConfidence() {
        return confidence;
    }


    public void setConfidence(
            String confidence
    ) {
        this.confidence =
                confidence;
    }


    public Integer getHistoricalProjectCount() {
        return historicalProjectCount;
    }


    public void setHistoricalProjectCount(
            Integer historicalProjectCount
    ) {
        this.historicalProjectCount =
                historicalProjectCount;
    }


    public boolean isHistoryAvailable() {
        return historyAvailable;
    }


    public void setHistoryAvailable(
            boolean historyAvailable
    ) {
        this.historyAvailable =
                historyAvailable;
    }


    public String getReason() {
        return reason;
    }


    public void setReason(
            String reason
    ) {
        this.reason =
                reason;
    }


    public List<PastProjectMatchResponse>
    getPastProjectMatches() {
        return pastProjectMatches;
    }


    public void setPastProjectMatches(
            List<PastProjectMatchResponse>
                    pastProjectMatches
    ) {

        this.pastProjectMatches =
                pastProjectMatches;
    }
}