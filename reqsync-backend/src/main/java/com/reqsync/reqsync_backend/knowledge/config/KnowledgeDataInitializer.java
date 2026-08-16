package com.reqsync.reqsync_backend.knowledge.config;

import com.reqsync.reqsync_backend.knowledge.entity.KnowledgeItem;
import com.reqsync.reqsync_backend.knowledge.enums.KnowledgeCategory;
import com.reqsync.reqsync_backend.knowledge.repository.KnowledgeItemRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class KnowledgeDataInitializer {

    @Bean
    CommandLineRunner initializeKnowledgeVault(
            KnowledgeItemRepository repository
    ) {

        return args -> {

            if (
                    repository.count() > 0
            ) {

                return;
            }


            create(
                    repository,
                    "K-01",
                    "Payment Gateway Requirements & API Specifications",
                    "Online Banking System",
                    KnowledgeCategory.REQUIREMENTS,
                    "2026-06-12"
            );

            create(
                    repository,
                    "K-02",
                    "Two-Factor Authentication Architecture Decisions",
                    "Banking App 2025",
                    KnowledgeCategory.DECISIONS,
                    "2026-06-10"
            );

            create(
                    repository,
                    "K-03",
                    "Performance Testing Lessons and Index Optimization",
                    "General",
                    KnowledgeCategory.LESSONS_LEARNED,
                    "2026-06-08"
            );

            create(
                    repository,
                    "K-04",
                    "Common Login Security Issues and Remediation Policies",
                    "Online Banking System",
                    KnowledgeCategory.QA_FINDINGS,
                    "2026-06-05"
            );

            create(
                    repository,
                    "K-05",
                    "Software Requirement Specification (SRS) Standard Template v3.0",
                    "Internal",
                    KnowledgeCategory.TEMPLATES,
                    "2026-06-01"
            );
        };
    }


    private void create(
            KnowledgeItemRepository repository,
            String code,
            String title,
            String projectName,
            KnowledgeCategory category,
            String date
    ) {

        KnowledgeItem item =
                new KnowledgeItem();

        item.setCode(code);
        item.setTitle(title);
        item.setProjectId(null);
        item.setProjectName(projectName);
        item.setCategory(category);
        item.setDate(
                LocalDate.parse(date)
        );


        repository.save(
                item
        );


        System.out.println(
                "Created knowledge vault item: "
                        + code
                        + " / "
                        + title
        );
    }
}
