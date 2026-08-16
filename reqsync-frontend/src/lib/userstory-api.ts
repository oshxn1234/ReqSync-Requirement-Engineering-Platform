import { apiRequest } from './api-client';

export interface UserStoryDto {
  id: number;
  code?: string;
  title: string;
  status: string;
  priority: string;
  relatedReq: string;
  assignee: string;
}

export async function getProjectUserStories(projectId: number): Promise<UserStoryDto[]> {
  return apiRequest<UserStoryDto[]>(`/projects/${projectId}/user-stories`, { method: 'GET' });
}

export async function generateUserStories(projectId: number): Promise<UserStoryDto[]> {
  return apiRequest<UserStoryDto[]>(`/projects/${projectId}/user-stories/generate`, { method: 'POST' });
}

export async function updateUserStoryApi(storyId: number, payload: Partial<UserStoryDto>) {
  return apiRequest(`/user-stories/${storyId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteUserStoryApi(storyId: number) {
  return apiRequest(`/user-stories/${storyId}`, { method: 'DELETE' });
}
