import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   KNOWLEDGE CATEGORY

   Backend serializes KnowledgeCategory using the
   display names from @JsonValue.
   ========================================================= */

export type KnowledgeCategory =
  | 'Requirements'
  | 'Decisions'
  | 'Lessons Learned'
  | 'QA Findings'
  | 'Templates';


/* =========================================================
   CREATE KNOWLEDGE REQUEST

   Matches CreateKnowledgeItemRequest.
   ========================================================= */

export interface CreateKnowledgeItemRequest {

  /*
   * null = shared/general resource.
   *
   * If supplied, the backend only permits
   * COMPLETED projects.
   */
  projectId?: number | null;

  title: string;

  category: KnowledgeCategory;
}


/* =========================================================
   KNOWLEDGE ITEM RESPONSE

   Matches KnowledgeItemResponse.
   ========================================================= */

export interface KnowledgeItemResponse {

  /*
   * Backend returns codes such as K-01.
   */
  id: string;

  title: string;

  project: string;

  category: KnowledgeCategory;

  date: string;

  /*
   * Example:
   * "SRS"
   */
  referenceType: string | null;

  /*
   * ID of the referenced backend document.
   */
  referenceId: number | null;
}


/* =========================================================
   GET KNOWLEDGE VAULT

   GET /api/knowledge
   ========================================================= */

export async function getKnowledgeVault():
Promise<KnowledgeItemResponse[]> {

  return apiRequest<
    KnowledgeItemResponse[]
  >(
    '/knowledge',
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   CREATE KNOWLEDGE ITEM

   POST /api/knowledge
   ========================================================= */

export async function createKnowledgeItem(
  request: CreateKnowledgeItemRequest
): Promise<KnowledgeItemResponse> {

  return apiRequest<
    KnowledgeItemResponse
  >(
    '/knowledge',
    {
      method: 'POST',

      body:
        JSON.stringify(
          request
        ),
    }
  );
}