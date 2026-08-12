package com.reqsync.reqsync_backend.uml.source;

import com.reqsync.reqsync_backend.uml.dto.RequirementForUml;
import com.reqsync.reqsync_backend.uml.source.entity.ExtractedRequirement;
import com.reqsync.reqsync_backend.uml.source.repository.ExtractedRequirementRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DemoRequirementSource
        implements UmlRequirementSource {

    private final ExtractedRequirementRepository
            requirementRepository;


    public DemoRequirementSource(
            ExtractedRequirementRepository requirementRepository
    ) {
        this.requirementRepository =
                requirementRepository;
    }


    @Override
    public List<RequirementForUml>
    getApprovedRequirements(
            Long projectId
    ) {

        List<ExtractedRequirement> requirements =
                requirementRepository
                        .findByProjectIdAndStatusOrderByIdAsc(
                                projectId,
                                "APPROVED"
                        );


        return requirements
                .stream()
                .map(requirement ->
                        new RequirementForUml(

                                requirement
                                        .getRequirementCode(),

                                requirement
                                        .getTitle(),

                                requirement
                                        .getDescription(),

                                requirement
                                        .getRequirementType()
                        )
                )
                .toList();
    }
}