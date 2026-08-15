import {
  apiRequest
} from '@/lib/api-client';


export type ExtractionStatus =
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';


export type RequirementType =
  | 'FUNCTIONAL'
  | 'NON_FUNCTIONAL'
  | 'BUSINESS'
  | 'TECHNICAL'
  | 'SECURITY'
  | 'PERFORMANCE';


export type RequirementPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';


export type RequirementStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'REJECTED';


export interface RequirementExtractionRequest {
  projectId: number;
  documentContent: string;
}


export interface ExtractedRequirement {
  id: number;

  code: string;

  title: string;

  description: string;

  type: RequirementType;

  priority: RequirementPriority;

  status: RequirementStatus;

  confidenceScore: number | null;
}


export interface RequirementExtractionResponse {
  extractionId: number;

  projectId: number;

  status: ExtractionStatus;

  requirementCount: number;

  requirements: ExtractedRequirement[];

  message: string | null;

  createdAt: string;
}


/*
 * POST /api/requirements/extract
 */
export async function extractRequirements(
  request: RequirementExtractionRequest
): Promise<RequirementExtractionResponse> {

  return apiRequest<RequirementExtractionResponse>(
    '/requirements/extract',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}


/*
 * GET /api/requirements/project/{projectId}/latest
 */
export async function getLatestRequirementExtraction(
  projectId: number
): Promise<RequirementExtractionResponse> {

  return apiRequest<RequirementExtractionResponse>(
    `/requirements/project/${projectId}/latest`,
    {
      method: 'GET',
    }
  );
}