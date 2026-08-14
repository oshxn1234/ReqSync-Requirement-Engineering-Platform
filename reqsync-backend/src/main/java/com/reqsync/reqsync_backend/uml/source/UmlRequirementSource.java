package com.reqsync.reqsync_backend.uml.source;

import com.reqsync.reqsync_backend.uml.dto.RequirementForUml;

import java.util.List;

public interface UmlRequirementSource {

    List<RequirementForUml> getApprovedRequirements(
            Long projectId
    );
}