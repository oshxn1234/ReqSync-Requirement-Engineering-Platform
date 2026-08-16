import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   PROJECT MEMBER TYPES
   ========================================================= */

export type TeamMemberRole =
  | 'PROJECT_MANAGER'
  | 'BUSINESS_ANALYST'
  | 'DEVELOPER'
  | 'QA_ENGINEER';


export interface ProjectMemberResponse {
  membershipId: number;

  projectId: number;

  projectNumber: number;

  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  role: TeamMemberRole;

  active: boolean;

  assignedAt: string;
}


/* =========================================================
   BA SUITABILITY TYPES
   ========================================================= */

export interface RequirementExperienceMatchResponse {
  requirementId: number;

  requirementCode: string;

  requirementTitle: string;

  requirementDescription: string;

  similarity: number;
}


export interface PastProjectMatchResponse {
  projectId: number;

  projectNumber: number;

  projectName: string;

  relevanceScore: number;

  requirementMatches:
    RequirementExperienceMatchResponse[];
}


export interface BASuitabilityResponse {
  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  suitabilityScore: number;

  confidence:
    string;

  historicalProjectCount: number;

  historyAvailable: boolean;

  reason: string;

  pastProjectMatches:
    PastProjectMatchResponse[];
}


/* =========================================================
   TECHNICAL SUITABILITY TYPES
   ========================================================= */

export interface TechnicalRequirementMatchResponse {
  newRequirementId: number;

  newRequirementCode: string;

  newRequirementTitle: string;

  historicalRequirementId: number;

  historicalRequirementCode: string;

  historicalRequirementTitle: string;

  historicalProjectId: number;

  historicalProjectName: string;

  similarity: number;
}


export interface TechnicalTeamSuitabilityResponse {
  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  role:
    | 'DEVELOPER'
    | 'QA_ENGINEER';

  suitabilityScore: number;

  confidence: string;

  historicalProjectCount: number;

  historyAvailable: boolean;

  matchedRequirementCount: number;

  reason: string;

  requirementMatches:
    TechnicalRequirementMatchResponse[];
}


/* =========================================================
   PROJECT MEMBERS
   ========================================================= */

/*
 * GET
 * /api/projects/{projectId}/members
 */
export async function getProjectMembers(
  projectId: number
): Promise<ProjectMemberResponse[]> {

  return apiRequest<
    ProjectMemberResponse[]
  >(
    `/projects/${projectId}/members`,
    {
      method: 'GET',
    }
  );
}


/*
 * POST
 * /api/projects/{projectId}/members/{userId}
 *
 * Project Manager only.
 */
export async function addProjectMember(
  projectId: number,
  userId: number
): Promise<ProjectMemberResponse> {

  return apiRequest<
    ProjectMemberResponse
  >(
    `/projects/${projectId}/members/${userId}`,
    {
      method: 'POST',
    }
  );
}


/*
 * DELETE
 * /api/projects/{projectId}/members/{userId}
 *
 * Project Manager only.
 */
export async function removeProjectMember(
  projectId: number,
  userId: number
): Promise<void> {

  return apiRequest<void>(
    `/projects/${projectId}/members/${userId}`,
    {
      method: 'DELETE',
    }
  );
}


/* =========================================================
   BUSINESS ANALYST SUITABILITY
   ========================================================= */

/*
 * GET
 * /api/projects/{projectId}/suitability/business-analysts
 *
 * Used BEFORE requirement extraction.
 */
export async function getBusinessAnalystSuitability(
  projectId: number
): Promise<BASuitabilityResponse[]> {

  return apiRequest<
    BASuitabilityResponse[]
  >(
    `/projects/${projectId}/suitability/business-analysts`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   DEVELOPER + QA SUITABILITY
   ========================================================= */

/*
 * GET
 * /api/projects/{projectId}/suitability/team
 *
 * Used AFTER requirement extraction.
 */
export async function getTechnicalTeamSuitability(
  projectId: number
): Promise<
  TechnicalTeamSuitabilityResponse[]
> {

  return apiRequest<
    TechnicalTeamSuitabilityResponse[]
  >(
    `/projects/${projectId}/suitability/team`,
    {
      method: 'GET',
    }
  );
}