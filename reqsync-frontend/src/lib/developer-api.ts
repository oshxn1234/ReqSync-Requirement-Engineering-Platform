import {
  apiRequest
} from '@/lib/api-client';


export type DeveloperTaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'READY_FOR_QA'
  | 'QA_IN_PROGRESS'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED';


export type DeveloperSubmissionStatus =
  | 'SUBMITTED'
  | 'QA_IN_PROGRESS'
  | 'CHANGES_REQUESTED'
  | 'APPROVED';


export interface DeveloperTaskResponse {
  id: number;

  requirementId: number;

  userStoryId: number;

  assignedDeveloperId: number;

  title: string;

  description: string;

  priority: string;

  status: DeveloperTaskStatus;

  implementationNotes: string | null;

  githubBranch: string | null;

  pullRequestUrl: string | null;
}


export interface DeveloperTaskRequest {
  requirementId: number;

  userStoryId: number;

  assignedDeveloperId: number;

  title: string;

  description: string;

  priority: string;
}


export interface DeveloperSubmissionRequest {
  implementationNotes: string;

  githubBranch?: string;

  pullRequestUrl?: string;

  commitHash?: string;
}


export interface DeveloperSubmissionResponse {
  id: number;

  taskId: number;

  developerId: number;

  implementationNotes: string;

  githubBranch: string | null;

  pullRequestUrl: string | null;

  commitHash: string | null;

  status: DeveloperSubmissionStatus;
}


/*
 * POST /api/developer/tasks
 */
export async function createDeveloperTask(
  request: DeveloperTaskRequest
): Promise<DeveloperTaskResponse> {

  return apiRequest<DeveloperTaskResponse>(
    '/developer/tasks',
    {
      method: 'POST',

      body: JSON.stringify(
        request
      ),
    }
  );
}


/*
 * GET /api/developer/tasks/{taskId}
 */
export async function getDeveloperTask(
  taskId: number
): Promise<DeveloperTaskResponse> {

  return apiRequest<DeveloperTaskResponse>(
    `/developer/tasks/${taskId}`,
    {
      method: 'GET',
    }
  );
}


/*
 * GET /api/developer/tasks/my
 */
export async function getMyDeveloperTasks():
Promise<DeveloperTaskResponse[]> {

  return apiRequest<DeveloperTaskResponse[]>(
    '/developer/tasks/my',
    {
      method: 'GET',
    }
  );
}


/*
 * PUT /api/developer/tasks/{taskId}/status
 */
export async function updateDeveloperTaskStatus(
  taskId: number,
  status: DeveloperTaskStatus
): Promise<DeveloperTaskResponse> {

  return apiRequest<DeveloperTaskResponse>(
    `/developer/tasks/${taskId}/status`,
    {
      method: 'PUT',

      body: JSON.stringify({
        status,
      }),
    }
  );
}


/*
 * POST /api/developer/tasks/{taskId}/submissions
 */
export async function submitDeveloperWork(
  taskId: number,
  request: DeveloperSubmissionRequest
): Promise<DeveloperSubmissionResponse> {

  return apiRequest<DeveloperSubmissionResponse>(
    `/developer/tasks/${taskId}/submissions`,
    {
      method: 'POST',

      body: JSON.stringify(
        request
      ),
    }
  );
}


/*
 * GET /api/developer/tasks/{taskId}/submissions
 */
export async function getDeveloperTaskSubmissions(
  taskId: number
): Promise<DeveloperSubmissionResponse[]> {

  return apiRequest<DeveloperSubmissionResponse[]>(
    `/developer/tasks/${taskId}/submissions`,
    {
      method: 'GET',
    }
  );
}