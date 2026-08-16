import { apiRequest } from './api-client';

export interface BusinessRegistrationRequest {
  businessName: string;
  registrationNumber: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  ceoFirstName: string;
  ceoLastName: string;
  ceoEmail: string;
  ceoPassword: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface BusinessRegistrationResponse {
  businessId: number;
  businessName: string;
  ceoId: number;
  ceoEmail: string;
  systemAdminId: number;
  systemAdminEmail: string;
  message: string;
}

export function registerBusiness(
  request: BusinessRegistrationRequest
): Promise<BusinessRegistrationResponse> {
  return apiRequest<BusinessRegistrationResponse>(
    '/businesses/register',
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
}
