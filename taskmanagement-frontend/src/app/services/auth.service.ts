import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthResponse, LoginRequest, SignupRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', request);
  }

  signup(request: SignupRequest): Observable<void> {
    return this.apiService.post<void>('/auth/signup', request);
  }
} 