package com.reqsync.reqsync_backend.team.dto;

import com.reqsync.reqsync_backend.auth.entity.Role;

import java.util.List;

public class TechnicalTeamSuitabilityResponse {

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private Role role;

    private double suitabilityScore;

    private String confidence;

    private int historicalProjectCount;

    private boolean historyAvailable;

    private int matchedRequirementCount;

    private String reason;

    private List<TechnicalRequirementMatchResponse>
            requirementMatches;


    public TechnicalTeamSuitabilityResponse() {
    }


    public TechnicalTeamSuitabilityResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            Role role,
            double suitabilityScore,
            String confidence,
            int historicalProjectCount,
            boolean historyAvailable,
            int matchedRequirementCount,
            String reason,
            List<TechnicalRequirementMatchResponse>
                    requirementMatches
    ) {

        this.userId =
                userId;

        this.firstName =
                firstName;

        this.lastName =
                lastName;

        this.email =
                email;

        this.role =
                role;

        this.suitabilityScore =
                suitabilityScore;

        this.confidence =
                confidence;

        this.historicalProjectCount =
                historicalProjectCount;

        this.historyAvailable =
                historyAvailable;

        this.matchedRequirementCount =
                matchedRequirementCount;

        this.reason =
                reason;

        this.requirementMatches =
                requirementMatches;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(
            String firstName
    ) {
        this.firstName = firstName;
    }


    public String getLastName() {
        return lastName;
    }

    public void setLastName(
            String lastName
    ) {
        this.lastName = lastName;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public Role getRole() {
        return role;
    }

    public void setRole(
            Role role
    ) {
        this.role = role;
    }


    public double getSuitabilityScore() {
        return suitabilityScore;
    }

    public void setSuitabilityScore(
            double suitabilityScore
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
        this.confidence = confidence;
    }


    public int getHistoricalProjectCount() {
        return historicalProjectCount;
    }

    public void setHistoricalProjectCount(
            int historicalProjectCount
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


    public int getMatchedRequirementCount() {
        return matchedRequirementCount;
    }

    public void setMatchedRequirementCount(
            int matchedRequirementCount
    ) {
        this.matchedRequirementCount =
                matchedRequirementCount;
    }


    public String getReason() {
        return reason;
    }

    public void setReason(
            String reason
    ) {
        this.reason = reason;
    }


    public List<TechnicalRequirementMatchResponse>
    getRequirementMatches() {
        return requirementMatches;
    }

    public void setRequirementMatches(
            List<TechnicalRequirementMatchResponse>
                    requirementMatches
    ) {
        this.requirementMatches =
                requirementMatches;
    }
}