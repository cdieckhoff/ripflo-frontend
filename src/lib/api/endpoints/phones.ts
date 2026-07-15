import { apiFetch } from '../client';
import { getEpAddresses } from '../endpoints'; // We'll add getEpPhones to endpoints.ts
import { type ApiData } from '../types.js';

// Phone Type interface for the phone types list
export interface PhoneType {
  id: number;
  name: string;
  display_name: string;
}

// Function to list phone types
export async function listPhoneTypes() {
  // This would typically call an endpoint like /phone_types
  // For now, returning the enum values as objects
  return {
    data: [
      { id: 1, name: 'mobile', display_name: 'Mobile' },
      { id: 2, name: 'cell', display_name: 'Cell' },
      { id: 3, name: 'fax', display_name: 'Fax' },
      { id: 4, name: 'home', display_name: 'Home' },
      { id: 5, name: 'primary', display_name: 'Primary' },
      { id: 6, name: 'secondary', display_name: 'Secondary' },
      { id: 7, name: 'temporary', display_name: 'Temporary' },
      { id: 8, name: 'main', display_name: 'Main' },
      { id: 9, name: 'support', display_name: 'Support' },
      { id: 10, name: 'emergency', display_name: 'Emergency' },
    ],
    error: null
  };
}