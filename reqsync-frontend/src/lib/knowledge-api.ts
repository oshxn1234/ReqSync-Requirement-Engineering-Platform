import { apiRequest } from './api-client';

export interface KnowledgeItemDto {
  id: string;
  title: string;
  project: string;
  category: string;
  date: string;
}

export async function getProjectKnowledge(projectId: number): Promise<KnowledgeItemDto[]> {
  try {
    return await apiRequest<KnowledgeItemDto[]>(`/knowledge/project/${projectId}`, { method: 'GET' });
  } catch (err) {
    // Bubble up error to caller to decide fallback to local store
    throw err;
  }
}

export async function addKnowledgeItem(request: { projectId: number; title: string; category: string }): Promise<KnowledgeItemDto> {
  return apiRequest<KnowledgeItemDto>('/knowledge', { method: 'POST', body: JSON.stringify(request) });
}
