import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   TRACEABILITY TYPES
   ========================================================= */

export type TraceabilityArtifactType =
  | 'USER_STORY'
  | 'SRS_VERSION'
  | 'UML_DIAGRAM_VERSION'
  | 'DEVELOPER_SUBMISSION';


export type TraceabilityRelationType =
  | 'GENERATED_AS_USER_STORY'
  | 'DOCUMENTED_IN_SRS'
  | 'DESIGNED_IN_UML'
  | 'IMPLEMENTED_BY_DEVELOPER_SUBMISSION';


/* =========================================================
   ARTIFACT RESPONSE
   ========================================================= */

export interface TraceabilityArtifactResponse {

  linkId: number;

  relationType:
    TraceabilityRelationType;

  artifactType:
    TraceabilityArtifactType;

  artifactId: number;

  artifactCode:
    string | null;

  artifactTitle:
    string | null;

  artifactVersion:
    number | null;

  linkedAt:
    string | null;
}


/* =========================================================
   REQUIREMENT TRACEABILITY
   ========================================================= */

export interface RequirementTraceabilityResponse {

  requirementId:
    number;

  requirementCode:
    string;

  requirementTitle:
    string;

  requirementStatus:
    string;

  extractionId:
    number | null;

  sourceDocument:
    string | null;

  artifacts:
    TraceabilityArtifactResponse[];
}


/* =========================================================
   PROJECT TRACEABILITY
   ========================================================= */

export interface ProjectTraceabilityResponse {

  projectId:
    number;

  projectNumber:
    number;

  projectName:
    string;

  totalRequirements:
    number;

  approvedRequirements:
    number;

  tracedRequirements:
    number;

  requirements:
    RequirementTraceabilityResponse[];
}


/* =========================================================
   SYNC RESPONSE
   ========================================================= */

export interface TraceabilitySyncResponse {

  projectId:
    number;

  syncedUserStories:
    number;

  message:
    string;
}


/* =========================================================
   GET PROJECT TRACEABILITY

   GET /api/projects/{projectId}/traceability
   ========================================================= */

export async function getProjectTraceability(
  projectId: number
): Promise<ProjectTraceabilityResponse> {

  return apiRequest<ProjectTraceabilityResponse>(
    `/projects/${projectId}/traceability`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET REQUIREMENT TRACEABILITY

   GET /api/requirements/{requirementId}/traceability
   ========================================================= */

export async function getRequirementTraceability(
  requirementId: number
): Promise<RequirementTraceabilityResponse> {

  return apiRequest<RequirementTraceabilityResponse>(
    `/requirements/${requirementId}/traceability`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   SYNC EXISTING USER STORIES

   POST /api/projects/{projectId}/traceability/sync-user-stories
   ========================================================= */

export async function syncExistingUserStoryTraceability(
  projectId: number
): Promise<TraceabilitySyncResponse> {

  return apiRequest<TraceabilitySyncResponse>(
    `/projects/${projectId}/traceability/sync-user-stories`,
    {
      method: 'POST',
    }
  );
}