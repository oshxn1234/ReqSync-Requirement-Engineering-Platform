import { apiRequest } from './api-client';

export type BackendEmployeeRole =
  | 'PROJECT_MANAGER'
  | 'BUSINESS_ANALYST'
  | 'DEVELOPER'
  | 'QA_ENGINEER';

export interface EmployeeRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: BackendEmployeeRole;
}

export interface EmployeeResponse {
  id: number;
  businessId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: BackendEmployeeRole;
  enabled: boolean;
  accountLocked: boolean;
  createdAt: string;
}

export function getEmployees(): Promise<EmployeeResponse[]> {
  return apiRequest<EmployeeResponse[]>('/users/employees');
}

export function createEmployee(
  request: EmployeeRegistrationRequest
): Promise<EmployeeResponse> {
  return apiRequest<EmployeeResponse>(
    '/users/employees',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}