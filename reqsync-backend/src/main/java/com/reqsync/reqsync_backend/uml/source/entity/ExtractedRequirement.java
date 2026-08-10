package com.reqsync.reqsync_backend.uml.source.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "extracted_requirements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtractedRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(
            name = "requirement_code",
            nullable = false
    )
    private String requirementCode;

    @Column(nullable = false)
    private String title;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;

    @Column(
            name = "requirement_type",
            nullable = false
    )
    private String requirementType;

    @Column(nullable = false)
    private String status;
}