package com.reqsync.reqsync_backend.knowledge.dto;

import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;

public class KnowledgeItemResponse {

    private String id;

    private String title;

    private String project;

    private KnowledgeCategory category;

    private String date;


    public KnowledgeItemResponse() {
    }


    public KnowledgeItemResponse(
            String id,
            String title,
            String project,
            KnowledgeCategory category,
            String date
    ) {

        this.id = id;
        this.title = title;
        this.project = project;
        this.category = category;
        this.date = date;
    }


    public String getId() {
        return id;
    }

    public void setId(
            String id
    ) {
        this.id = id;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public String getProject() {
        return project;
    }

    public void setProject(
            String project
    ) {
        this.project = project;
    }


    public KnowledgeCategory getCategory() {
        return category;
    }

    public void setCategory(
            KnowledgeCategory category
    ) {
        this.category = category;
    }


    public String getDate() {
        return date;
    }

    public void setDate(
            String date
    ) {
        this.date = date;
    }
}
