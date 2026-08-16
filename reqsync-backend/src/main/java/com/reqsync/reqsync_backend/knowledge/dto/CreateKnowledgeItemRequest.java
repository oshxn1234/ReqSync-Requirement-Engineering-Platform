package com.reqsync.reqsync_backend.knowledge.dto;

import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;

public class CreateKnowledgeItemRequest {

    private Long projectId;

    private String title;

    private KnowledgeCategory category;


    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(
            Long projectId
    ) {
        this.projectId = projectId;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }


    public KnowledgeCategory getCategory() {
        return category;
    }

    public void setCategory(
            KnowledgeCategory category
    ) {
        this.category = category;
    }
}
