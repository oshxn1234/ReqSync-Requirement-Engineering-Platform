package com.reqsync.reqsync_backend.requirement.dto;

public class PotentialGapResponse {

    private String topic;

    private String description;


    public PotentialGapResponse() {
    }


    public PotentialGapResponse(
            String topic,
            String description
    ) {

        this.topic = topic;
        this.description = description;
    }


    public String getTopic() {
        return topic;
    }


    public void setTopic(
            String topic
    ) {
        this.topic = topic;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
            String description
    ) {
        this.description = description;
    }
}