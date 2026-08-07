package com.reqsync.reqsync_backend.uml.entity;

import com.reqsync.reqsync_backend.uml.enums.DiagramSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "uml_diagram_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassDiagramVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "diagram_id", nullable = false)
    private Long diagramId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "plantuml_code", nullable = false, columnDefinition = "TEXT")
    private String plantUmlCode;

    @Column(name = "requirements_snapshot", columnDefinition = "TEXT")
    private String requirementsSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagramSource source;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist()
    {
        createdAt = LocalDateTime.now();

        if (source == null)
        {
            source = DiagramSource.AI;
        }
    }
}