import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   TASK TYPES
   ========================================================= */

export type DeveloperTaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'READY_FOR_QA'
  | 'COMPLETED';


export type DeveloperTaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';


/* =========================================================
   PROJECT MEMBER RESPONSE
   ========================================================= */

export interface ProjectMemberResponse {

  membershipId: number;

  projectId: number;

  projectNumber: number;

  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  role:
    | 'CEO'
    | 'SYSTEM_ADMIN'
    | 'PROJECT_MANAGER'
    | 'BUSINESS_ANALYST'
    | 'DEVELOPER'
    | 'QA_ENGINEER';

  active: boolean;

  assignedAt: string;
}


/* =========================================================
   CREATE TASK REQUEST
   ========================================================= */

export interface DeveloperTaskCreateRequest {

  requirementId: number;

  userStoryId: number;

  assignedDeveloperId: number;

  title: string;

  description: string;

  priority: DeveloperTaskPriority;
}


/* =========================================================
   TASK RESPONSE
   ========================================================= */

export interface DeveloperTaskResponse {

  id: number;

  requirementId: number;

  userStoryId: number;

  assignedDeveloperId: number;

  title: string;

  description: string;

  priority: DeveloperTaskPriority;

  status: DeveloperTaskStatus;

  implementationNotes: string | null;

  githubBranch: string | null;

  pullRequestUrl: string | null;
}


/* =========================================================
   GET PROJECT MEMBERS

   GET /api/projects/{projectId}/members
   ========================================================= */

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


/* =========================================================
   CREATE DEVELOPER TASK

   POST /api/developer/tasks
   ========================================================= */

export async function createDeveloperTask(
  request:
    DeveloperTaskCreateRequest
): Promise<DeveloperTaskResponse> {

  return apiRequest<
    DeveloperTaskResponse
  >(
    '/developer/tasks',
    {
      method: 'POST',

      body:
        JSON.stringify(
          request
        ),
    }
  );
}


/* =========================================================
   GET SINGLE TASK

   GET /api/developer/tasks/{taskId}
   ========================================================= */

export async function getDeveloperTask(
  taskId: number
): Promise<DeveloperTaskResponse> {

  return apiRequest<
    DeveloperTaskResponse
  >(
    `/developer/tasks/${taskId}`,
    {
      method: 'GET',
    }
  );
}