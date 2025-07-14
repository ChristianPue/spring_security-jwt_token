import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeveloperRequest, DeveloperResponse } from '../models/developer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {
  private apiUrl = `${environment.apiUrl}/developers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DeveloperResponse[]> {
    return this.http.get<DeveloperResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<DeveloperResponse> {
    return this.http.get<DeveloperResponse>(`${this.apiUrl}/${id}`);
  }

  create(developer: DeveloperRequest): Observable<DeveloperResponse> {
    return this.http.post<DeveloperResponse>(this.apiUrl, developer);
  }

  update(id: number, developer: DeveloperRequest): Observable<DeveloperResponse> {
    return this.http.put<DeveloperResponse>(`${this.apiUrl}/${id}`, developer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadExcel(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/upload`, formData);
  }

  getPaginated(params: any = {}): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/paginated`, { params });
  }
} 