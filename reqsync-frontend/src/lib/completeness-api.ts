import { apiRequest } from '@/lib/api-client';

export type CompletenessStatus =
  | 'COMPLETE'
  | 'NEEDS_IMPROVEMENT'
  | 'INCOMPLETE';

export type CriterionStatus =
  | 'PASS'
  | 'PARTIAL'
  | 'FAIL';

export type CoverageStatus =
  | 'COVERED'
  | 'PARTIALLY_COVERED'
  | 'MISSING';

export interface RequirementSummaryResponse {
  id: number;
  code: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  confidenceScore: number | null;
}

export interface CompletenessCriterionResponse {
  criterion: string;
  status: CriterionStatus;
  explanation: string;
}

export interface CoverageCheckResponse {
  topic: string;
  status: CoverageStatus;
  relatedRequirementCode: string | null;
  reason: string;
}

export interface RequirementCompletenessResponse {
  requirementId: number;
  requirementCode: string;
  completenessScore: number;
  status: CompletenessStatus;
  criteria: CompletenessCriterionResponse[];
  coverageChecks: CoverageCheckResponse[];
  confirmedMissing: string[];
  suggestions: string[];
}

export async function getProjectRequirements(
  projectId: number
): Promise<RequirementSummaryResponse[]> {
  return apiRequest<RequirementSummaryResponse[]>(
    `/requirements/project/${projectId}`,
    {
      method: 'GET',
    }
  );
}

export async function analyzeRequirementCompleteness(
  requirementId: number
): Promise<RequirementCompletenessResponse> {
  return apiRequest<RequirementCompletenessResponse>(
    `/requirements/${requirementId}/completeness`,
    {
      method: 'POST',
    }
  );
}