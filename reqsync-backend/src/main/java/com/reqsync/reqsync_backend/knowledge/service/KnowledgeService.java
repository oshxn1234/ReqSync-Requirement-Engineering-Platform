package com.reqsync.reqsync_backend.knowledge.service;

import com.reqsync.reqsync_backend.knowledge.dto.CreateKnowledgeItemRequest;
import com.reqsync.reqsync_backend.knowledge.dto.KnowledgeItemResponse;
import com.reqsync.reqsync_backend.knowledge.entity.KnowledgeItem;
import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;
import com.reqsync.reqsync_backend.knowledge.repository.KnowledgeItemRepository;

import com.reqsync.reqsync_backend.project.entity.Project;
import com.reqsync.reqsync_backend.project.repository.ProjectRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class KnowledgeService {

    private final KnowledgeItemRepository
            knowledgeItemRepository;

    private final ProjectRepository
            projectRepository;


    public KnowledgeService(
            KnowledgeItemRepository knowledgeItemRepository,
            ProjectRepository projectRepository
    ) {

        this.knowledgeItemRepository =
                knowledgeItemRepository;

        this.projectRepository =
                projectRepository;
    }


    // ==========================================
    // GET PROJECT KNOWLEDGE
    // ==========================================

    @Transactional(
            readOnly = true
    )
    public List<KnowledgeItemResponse>
    getProjectKnowledge(
            Long projectId
    ) {

        return knowledgeItemRepository
                .findByProjectIdIsNullOrProjectIdOrderByIdAsc(
                        projectId
                )
                .stream()
                .map(
                        this::toResponse
                )
                .toList();
    }


    // ==========================================
    // CREATE KNOWLEDGE ITEM
    // ==========================================

    @Transactional
    public KnowledgeItemResponse
    createKnowledge(
            CreateKnowledgeItemRequest request
    ) {

        if (
                request.getTitle() == null
                        ||
                        request.getTitle().isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Knowledge item title is required."
            );
        }


        KnowledgeItem item =
                new KnowledgeItem();

        item.setTitle(
                request.getTitle().trim()
        );

        item.setCategory(
                request.getCategory() != null
                        ? request.getCategory()
                        : KnowledgeCategory.REQUIREMENTS
        );

        item.setProjectId(
                request.getProjectId()
        );

        item.setProjectName(
                resolveProjectName(
                        request.getProjectId()
                )
        );

        item.setCode(
                generateCode()
        );

        item.setDate(
                LocalDate.now()
        );


        return toResponse(
                knowledgeItemRepository.save(
                        item
                )
        );
    }


    // ==========================================
    // HELPERS
    // ==========================================

    private String resolveProjectName(
            Long projectId
    ) {

        if (projectId == null) {

            return "General";
        }


        return projectRepository
                .findById(
                        projectId
                )
                .map(
                        Project::getName
                )
                .orElse(
                        "General"
                );
    }


    private String generateCode() {

        long next =
                knowledgeItemRepository.count() + 1;

        return "K-"
                + String.format(
                        "%02d",
                        next
                );
    }


    private KnowledgeItemResponse toResponse(
            KnowledgeItem item
    ) {

        return new KnowledgeItemResponse(
                item.getCode(),
                item.getTitle(),
                item.getProjectName(),
                item.getCategory(),
                item.getDate().toString()
        );
    }
}
