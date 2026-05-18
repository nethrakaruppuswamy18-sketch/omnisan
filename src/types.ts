export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  CARETAKER = 'caretaker'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  timing: string;
  completed: boolean;
  createdAt: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  notes: string;
  createdAt: string;
}

export interface CaretakerRequest {
  id: string;
  patientId: string;
  caretakerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
}
