import { apiRequest } from './api-client';

export interface ApprovalDto {
  id: string;
  projectId: number;
  title: string;
  type: 'Requirement' | 'Baseline' | 'Change Request';
  requestedBy: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decidedBy: string | null;
  decidedOn: string | null;
}

export async function fetchApprovalsForProject(projectId: number): Promise<ApprovalDto[]> {
  return apiRequest<ApprovalDto[]>(`/approvals/project/${projectId}`, { method: 'GET' });
}

export async function approveApprovalApi(approvalId: string): Promise<ApprovalDto> {
  return apiRequest<ApprovalDto>(`/approvals/${approvalId}/approve`, { method: 'POST' });
}

export async function rejectApprovalApi(approvalId: string): Promise<ApprovalDto> {
  return apiRequest<ApprovalDto>(`/approvals/${approvalId}/reject`, { method: 'POST' });
}
