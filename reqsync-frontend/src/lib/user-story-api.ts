import {
  apiRequest
} from '@/lib/api-client';

import type {
  RequirementPriority
} from '@/lib/requirement-api';


/* =========================================================
   USER STORY RESPONSE
   Matches backend UserStoryResponse
   ========================================================= */

export interface UserStoryResponse {

  id: number;

  projectId: number;

  sourceRequirementId: number;

  sourceRequirementCode: string;

  code: string;

  title: string;

  actor: string;

  goal: string;

  benefit: string;

  story: string;

  acceptanceCriteria: string[];

  priority: RequirementPriority;

  reviewed: boolean;

  createdAt: string;

  updatedAt: string;
}


/* =========================================================
   UPDATE REQUEST
   Matches backend UserStoryUpdateRequest
   ========================================================= */

export interface UserStoryUpdateRequest {

  title?: string;

  actor?: string;

  goal?: string;

  benefit?: string;

  acceptanceCriteria?: string[];

  priority?: RequirementPriority;

  reviewed?: boolean;
}


/* =========================================================
   GENERATE USER STORIES

   POST /api/projects/{projectId}/user-stories/generate
   ========================================================= */

export async function generateUserStories(
  projectId: number
): Promise<UserStoryResponse[]> {

  return apiRequest<
    UserStoryResponse[]
  >(
    `/projects/${projectId}/user-stories/generate`,
    {
      method: 'POST',
    }
  );
}


/* =========================================================
   GET PROJECT USER STORIES

   GET /api/projects/{projectId}/user-stories
   ========================================================= */

export async function getProjectUserStories(
  projectId: number
): Promise<UserStoryResponse[]> {

  return apiRequest<
    UserStoryResponse[]
  >(
    `/projects/${projectId}/user-stories`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   UPDATE USER STORY

   PUT /api/user-stories/{storyId}
   ========================================================= */

export async function updateUserStory(
  storyId: number,
  request: UserStoryUpdateRequest
): Promise<UserStoryResponse> {

  return apiRequest<
    UserStoryResponse
  >(
    `/user-stories/${storyId}`,
    {
      method: 'PUT',

      body:
        JSON.stringify(
          request
        ),
    }
  );
}


/* =========================================================
   DELETE USER STORY

   DELETE /api/user-stories/{storyId}
   ========================================================= */

export async function deleteUserStory(
  storyId: number
): Promise<void> {

  return apiRequest<void>(
    `/user-stories/${storyId}`,
    {
      method: 'DELETE',
    }
  );
}