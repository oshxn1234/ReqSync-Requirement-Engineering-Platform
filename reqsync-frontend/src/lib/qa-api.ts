import {
  apiRequest
} from '@/lib/api-client';


/* =========================================================
   QA TYPES
   ========================================================= */

export type QAReviewStatus =
  | 'APPROVED'
  | 'REJECTED';


export type DeveloperSubmissionStatus =
  | 'SUBMITTED'
  | 'QA_REVIEW'
  | 'APPROVED'
  | 'REJECTED';


/* =========================================================
   DEVELOPER SUBMISSION RESPONSE

   Matches DeveloperSubmissionResponse from backend.
   ========================================================= */

export interface DeveloperSubmissionResponse {

  id: number;

  taskId: number;

  developerId: number;

  implementationNotes: string | null;

  githubBranch: string | null;

  pullRequestUrl: string | null;

  commitHash: string | null;

  status: DeveloperSubmissionStatus;

  submittedAt: string;
}


/* =========================================================
   QA REVIEW REQUEST

   Matches QAReviewRequest.
   ========================================================= */

export interface QAReviewRequest {

  status: QAReviewStatus;

  feedback: string;
}


/* =========================================================
   QA REVIEW RESPONSE

   Matches QAReviewResponse.
   ========================================================= */

export interface QAReviewResponse {

  id: number;

  submissionId: number;

  taskId: number;

  developerId: number;

  qaUserId: number;

  qaName: string;

  status: QAReviewStatus;

  feedback: string | null;

  reviewedAt: string;
}


/* =========================================================
   GET ALL QA SUBMISSIONS

   GET /api/developer/qa/submissions
   ========================================================= */

export async function getQaSubmissions():
Promise<DeveloperSubmissionResponse[]> {

  return apiRequest<
    DeveloperSubmissionResponse[]
  >(
    '/developer/qa/submissions',
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET PENDING QA SUBMISSIONS

   GET /api/developer/qa/submissions/pending
   ========================================================= */

export async function getPendingQaSubmissions():
Promise<DeveloperSubmissionResponse[]> {

  return apiRequest<
    DeveloperSubmissionResponse[]
  >(
    '/developer/qa/submissions/pending',
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET APPROVED QA SUBMISSIONS

   GET /api/developer/qa/submissions/approved
   ========================================================= */

export async function getApprovedQaSubmissions():
Promise<DeveloperSubmissionResponse[]> {

  return apiRequest<
    DeveloperSubmissionResponse[]
  >(
    '/developer/qa/submissions/approved',
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   GET REJECTED QA SUBMISSIONS

   GET /api/developer/qa/submissions/rejected
   ========================================================= */

export async function getRejectedQaSubmissions():
Promise<DeveloperSubmissionResponse[]> {

  return apiRequest<
    DeveloperSubmissionResponse[]
  >(
    '/developer/qa/submissions/rejected',
    {
      method: 'GET',
    }
  );
}


/* =========================================================
   REVIEW SUBMISSION

   POST /api/developer/qa/submissions/{submissionId}/review
   ========================================================= */

export async function reviewQaSubmission(
  submissionId: number,
  request: QAReviewRequest
): Promise<QAReviewResponse> {

  return apiRequest<
    QAReviewResponse
  >(
    `/developer/qa/submissions/${submissionId}/review`,
    {
      method: 'POST',

      body:
        JSON.stringify(
          request
        ),
    }
  );
}