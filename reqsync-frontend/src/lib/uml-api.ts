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
      headers: {
        'Content-Type': 'application/json',
      },
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
