import {
  apiRequest
} from '@/lib/api-client';


export type ApprovalType =
  | 'Requirement'
  | 'Baseline'
  | 'Change Request';


export type ApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected';


export interface ApprovalResponse {
  id: string;

  projectId: number;

  title: string;

  type: ApprovalType;

  requestedBy: string;

  requestedOn: string | null;

  status: ApprovalStatus;

  decidedBy: string | null;

  decidedOn: string | null;
}


export interface CreateApprovalRequest {
  projectId: number;

  title: string;

  type: ApprovalType;

  requestedOn?: string;
}


/*
 * GET /api/approvals/project/{projectId}
 */
export async function getProjectApprovals(
  projectId: number
): Promise<ApprovalResponse[]> {

  return apiRequest<ApprovalResponse[]>(
    `/approvals/project/${projectId}`,
    {
      method: 'GET',
    }
  );
}


/*
 * POST /api/approvals
 */
export async function createApproval(
  request: CreateApprovalRequest
): Promise<ApprovalResponse> {

  return apiRequest<ApprovalResponse>(
    '/approvals',
    {
      method: 'POST',

      body: JSON.stringify(
        request
      ),
    }
  );
}


/*
 * POST /api/approvals/{code}/approve
 */
export async function approveApproval(
  code: string
): Promise<ApprovalResponse> {

  return apiRequest<ApprovalResponse>(
    `/approvals/${code}/approve`,
    {
      method: 'POST',
    }
  );
}


/*
 * POST /api/approvals/{code}/reject
 */
export async function rejectApproval(
  code: string
): Promise<ApprovalResponse> {

  return apiRequest<ApprovalResponse>(
    `/approvals/${code}/reject`,
    {
      method: 'POST',
    }
  );
}