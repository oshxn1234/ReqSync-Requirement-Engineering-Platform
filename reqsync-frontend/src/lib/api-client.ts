const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080/api';


export class ApiError extends Error {
  status: number;
  responseBody?: string;

  constructor(
    message: string,
    status: number,
    responseBody?: string
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.responseBody = responseBody;
  }
}


export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const headers =
    new Headers(options.headers);


  /*
   * Automatically add JSON content type.
   */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json'
    );
  }


  /*
   * Automatically attach JWT for protected requests.
   */
  if (
    typeof window !== 'undefined' &&
    !headers.has('Authorization')
  ) {
    const token =
      localStorage.getItem('reqsync_token');

    if (token) {
      headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }
  }


  let response: Response;


  try {

    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
        cache: 'no-store',
      }
    );

  } catch {

    throw new Error(
      'Cannot connect to ReqSync backend. ' +
      'Make sure Spring Boot is running on http://localhost:8080.'
    );
  }


  if (!response.ok) {

    const responseBody =
      await response.text();


    let message =
      `Request failed with status ${response.status}`;


    if (responseBody) {

      try {

        const parsed =
          JSON.parse(responseBody);


        message =
          parsed.message ??
          parsed.error ??
          parsed.detail ??
          message;

      } catch {

        message =
          responseBody;
      }
    }


    throw new ApiError(
      message,
      response.status,
      responseBody
    );
  }


  /*
   * DELETE returns 204 No Content.
   */
  if (response.status === 204) {

    return undefined as T;
  }


  const responseText =
    await response.text();


  if (!responseText) {

    return undefined as T;
  }


  return JSON.parse(
    responseText
  ) as T;
}