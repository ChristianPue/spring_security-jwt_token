import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskRequest, TaskResponse } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TaskResponse[] | { content: TaskResponse[] }> {
    return this.http.get<TaskResponse[] | { content: TaskResponse[] }>(this.apiUrl);
  }

  getById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  create(task: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  update(id: number, task: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  findActiveByDeveloper(developerId: number): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/developer/${developerId}/active`);
  }

  updateStatus(id: number, status: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }

  changeStatus(id: number, status: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}/status`, { status });
  }

  findByDateRange(start: string, end: string, params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/range`, { params: { ...params, start, end } });
  }

  uploadExcel(formData: FormData) {
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'text' as 'json'
    });
  }

  getPaginated(params: any = {}): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }
} 