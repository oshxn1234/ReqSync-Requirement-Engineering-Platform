import { apiRequest } from '@/lib/api-client';

export interface SrsSection {
  title: string;
  content: string;
  order: number;
}

export interface SrsDocumentDto {
  id: number;
  projectId: number;
  projectName: string;
  version: number;
  title: string;
  status: 'GENERATED' | 'DRAFT' | 'REVIEWED' | 'APPROVED';
  sections: SrsSection[];
  markdownContent: string;
  createdAt: string;
  updatedAt: string;
}

export async function getProjectSrs(
  projectId: number
): Promise<SrsDocumentDto | undefined> {
  return apiRequest<SrsDocumentDto>(`/projects/${projectId}/srs`, {
    method: 'GET',
  });
}

export async function getProjectSrsVersions(
  projectId: number
): Promise<SrsDocumentDto[]> {
  return apiRequest<SrsDocumentDto[]>(`/projects/${projectId}/srs/versions`, {
    method: 'GET',
  });
}

export async function getSrsById(
  srsId: number
): Promise<SrsDocumentDto> {
  return apiRequest<SrsDocumentDto>(`/srs/${srsId}`, {
    method: 'GET',
  });
}

export async function generateProjectSrs(
  projectId: number
): Promise<SrsDocumentDto> {
  return apiRequest<SrsDocumentDto>(`/projects/${projectId}/srs/generate`, {
    method: 'POST',
  });
}

export async function updateSrs(
  srsId: number,
  payload: { title?: string; content?: string; status?: string }
): Promise<SrsDocumentDto> {
  return apiRequest<SrsDocumentDto>(`/srs/${srsId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteSrs(srsId: number): Promise<void> {
  return apiRequest(`/srs/${srsId}`, { method: 'DELETE' });
}
