export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface TaskRequest {
  title: string;
  description: string;
  developerId: number;
  startDate?: string;
  endDate?: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  status: string;
  developerName: string;
  startDate: string;
  endDate: string;
} 