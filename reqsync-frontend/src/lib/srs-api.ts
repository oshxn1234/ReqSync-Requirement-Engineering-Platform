import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   SRS STATUS
   ========================================================= */

export type SrsStatus =
  | 'GENERATED'
  | 'DRAFT'
  | 'REVIEWED'
  | 'APPROVED';


/* =========================================================
   SRS SECTION
   ========================================================= */

export interface SrsSection {

  title: string;

  content: string;

  order: number;
}


/* =========================================================
   SRS RESPONSE
   ========================================================= */

export interface SrsGenerationResponse {

  id: number;

  projectId: number;

  projectName: string;

  version: number;

  title: string;

  status: SrsStatus;

  sections: SrsSection[];

  markdownContent: string;

  createdAt: string;

  updatedAt: string;
}


/* =========================================================
   UPDATE REQUEST
   ========================================================= */

export interface SrsUpdateRequest {

  title?: string;

  content?: string;

  status?: SrsStatus;
}


/* =========================================================
   GENERATE SRS

   POST /api/projects/{projectId}/srs/generate
   ========================================================= */

export async function generateSrs(
  projectId: number
): Promise<SrsGenerationResponse> {

  return apiRequest<
    SrsGenerationResponse
  >(
    `/projects/${projectId}/srs/generate`,
    {
      method: 'POST',
    }
  );
}


/* =========================================================
   GET LATEST PROJECT SRS

   GET /api/projects/{projectId}/srs
   ========================================================= */

export async function getProjectSrs(
  projectId: number
): Promise<SrsGenerationResponse | null> {

  return apiRequest<
    SrsGenerationResponse | null
  >(
    `/projects/${projectId}/srs`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET ALL PROJECT SRS VERSIONS

   GET /api/projects/{projectId}/srs/versions
   ========================================================= */

export async function getSrsVersions(
  projectId: number
): Promise<SrsGenerationResponse[]> {

  return apiRequest<
    SrsGenerationResponse[]
  >(
    `/projects/${projectId}/srs/versions`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET SINGLE SRS VERSION

   GET /api/srs/{srsId}
   ========================================================= */

export async function getSrsById(
  srsId: number
): Promise<SrsGenerationResponse> {

  return apiRequest<
    SrsGenerationResponse
  >(
    `/srs/${srsId}`,
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   UPDATE SRS

   PUT /api/srs/{srsId}
   ========================================================= */

export async function updateSrs(
  srsId: number,
  request: SrsUpdateRequest
): Promise<SrsGenerationResponse> {

  return apiRequest<
    SrsGenerationResponse
  >(
    `/srs/${srsId}`,
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
   DELETE SRS

   DELETE /api/srs/{srsId}
   ========================================================= */

export async function deleteSrs(
  srsId: number
): Promise<void> {

  return apiRequest<void>(
    `/srs/${srsId}`,
    {
      method: 'DELETE',
    }
  );
}