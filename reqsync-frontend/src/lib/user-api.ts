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


/*
 * GET /api/users/employees
 */
export function getEmployees():
Promise<EmployeeResponse[]> {

  return apiRequest<EmployeeResponse[]>(
    '/users/employees'
  );
}


/*
 * POST /api/users/employees
 */
export function createEmployee(
  request: EmployeeRegistrationRequest
): Promise<EmployeeResponse> {

  return apiRequest<EmployeeResponse>(
    '/users/employees',
    {
      method: 'POST',

      body: JSON.stringify(
        request
      ),
    }
  );
}


/*
 * GET /api/users/employees/role/{role}
 *
 * Used when the CEO needs to load
 * employees belonging to a specific role,
 * such as Project Managers.
 */
export function getEmployeesByRole(
  role: BackendEmployeeRole
): Promise<EmployeeResponse[]> {

  return apiRequest<EmployeeResponse[]>(
    `/users/employees/role/${role}`,
    {
      method: 'GET',
    }
  );
}