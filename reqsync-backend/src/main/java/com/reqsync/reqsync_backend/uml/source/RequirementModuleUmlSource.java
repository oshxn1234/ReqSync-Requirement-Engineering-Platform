package com.reqsync.reqsync_backend.uml.source;

import com.reqsync.reqsync_backend.requirement.entity.Requirement;
import com.reqsync.reqsync_backend.requirement.enums.RequirementStatus;
import com.reqsync.reqsync_backend.requirement.repository.RequirementRepository;
import com.reqsync.reqsync_backend.uml.dto.RequirementForUml;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class RequirementModuleUmlSource implements UmlRequirementSource {

    private final RequirementRepository requirementRepository;

    public RequirementModuleUmlSource(
            RequirementRepository requirementRepository
    ) {
        this.requirementRepository = requirementRepository;
    }

    @Override
    public List<RequirementForUml> getApprovedRequirements(Long projectId) {

        if (projectId == null) {
            throw new IllegalArgumentException(
                    "Project ID cannot be null."
            );
        }

        List<Requirement> requirements =
                requirementRepository.findByProjectIdAndStatus(
                        projectId,
                        RequirementStatus.APPROVED
                );

        return requirements.stream()
                .sorted(Comparator.comparing(Requirement::getId))
                .map(requirement ->
                        new RequirementForUml(
                                requirement.getCode(),
                                requirement.getTitle(),
                                requirement.getDescription(),
                                requirement.getType() == null
                                        ? null
                                        : requirement.getType().name()
                        )
                )
                .toList();
    }
}