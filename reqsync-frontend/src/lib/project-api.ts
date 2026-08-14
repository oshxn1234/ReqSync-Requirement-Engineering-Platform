import {
  apiRequest
} from '@/lib/api-client';


export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';


export interface ProjectCreateRequest {
  name: string;
  description: string;
}


export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}


export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}


/*
 * POST /api/projects
 */
export async function createProject(
  request: ProjectCreateRequest
): Promise<ProjectResponse> {

  return apiRequest<ProjectResponse>(
    '/projects',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}


/*
 * GET /api/projects
 */
export async function getAllProjects():
Promise<ProjectResponse[]> {

  return apiRequest<ProjectResponse[]>(
    '/projects',
    {
      method: 'GET',
    }
  );
}


/*
 * GET /api/projects/{projectId}
 */
export async function getProjectById(
  projectId: number
): Promise<ProjectResponse> {

  return apiRequest<ProjectResponse>(
    `/projects/${projectId}`,
    {
      method: 'GET',
    }
  );
}


/*
 * GET /api/projects/status/{status}
 */
export async function getProjectsByStatus(
  status: ProjectStatus
): Promise<ProjectResponse[]> {

  return apiRequest<ProjectResponse[]>(
    `/projects/status/${status}`,
    {
      method: 'GET',
    }
  );
}


/*
 * PUT /api/projects/{projectId}
 */
export async function updateProject(
  projectId: number,
  request: ProjectUpdateRequest
): Promise<ProjectResponse> {

  return apiRequest<ProjectResponse>(
    `/projects/${projectId}`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );
}


/*
 * DELETE /api/projects/{projectId}
 */
export async function deleteProject(
  projectId: number
): Promise<void> {

  return apiRequest<void>(
    `/projects/${projectId}`,
    {
      method: 'DELETE',
    }
  );
}