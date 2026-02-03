export interface MedicalRecord {
  id: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  date: string;
  dbHash: string;
  chainHash: string;
}

export interface AccessRequest {
  id: string;
  doctorName: string;
  hospital: string;
  reason: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export enum RecordCreationStatus {
  IDLE = 'IDLE',
  ENCRYPTING = 'ENCRYPTING',
  STORING = 'STORING',
  SIGNING = 'SIGNING',
  COMPLETED = 'COMPLETED',
}
