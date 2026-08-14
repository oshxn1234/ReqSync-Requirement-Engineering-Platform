const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

export interface UmlGenerationResponse {
  diagramId: number;
  versionNumber: number;
  plantUmlCode: string;
  svgBase64: string;
}

export interface UmlDiagramSummaryResponse {
  diagramId: number;
  projectId: number;
  name: string;
  status: string;
  currentVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UmlVersionRecord {
  id: number;
  diagramId: number;
  versionNumber: number;
  plantUmlCode: string;
  requirementsSnapshot?: string | null;
  source?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
}

function getAuthToken(): string {
  if (typeof window === 'undefined') {
    throw new Error('Authentication is only available in the browser.');
  }

  const token = localStorage.getItem('reqsync_token');

  if (!token) {
    throw new Error('You are not authenticated. Please sign in again.');
  }

  return token;
}

function getAuthHeaders(
  includeJsonContentType = false
): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getAuthToken()}`,
  };

  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function getErrorMessage(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Request failed with status ${response.status}`;
  }

  try {
    const body = JSON.parse(text);

    return (
      body.message ||
      body.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return text;
  }
}

export async function generateUmlFromDatabase(
  projectId: number,
  projectName: string
): Promise<UmlGenerationResponse> {
  const url =
    `${API_BASE}/uml/generate-from-db/${projectId}` +
    `?projectName=${encodeURIComponent(projectName)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getProjectUmlDiagrams(
  projectId: number
): Promise<UmlDiagramSummaryResponse[]> {
  const response = await fetch(
    `${API_BASE}/uml/project/${projectId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getLatestUml(
  diagramId: number
): Promise<UmlGenerationResponse> {
  const response = await fetch(
    `${API_BASE}/uml/${diagramId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getUmlVersions(
  diagramId: number
): Promise<UmlVersionRecord[]> {
  const response = await fetch(
    `${API_BASE}/uml/${diagramId}/versions`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function saveEditedUmlVersion(
  diagramId: number,
  plantUmlCode: string
): Promise<UmlGenerationResponse> {
  const response = await fetch(
    `${API_BASE}/uml/${diagramId}/versions`,
    {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        plantUmlCode,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}