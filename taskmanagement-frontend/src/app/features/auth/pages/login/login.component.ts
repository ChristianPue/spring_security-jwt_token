import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, ReactiveFormsModule],
  template: `
    <app-navbar></app-navbar>
    <div class="form-container">
      <div class="form-card">
        <div class="form-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#4f46e5"/>
            <text x="50%" y="55%" text-anchor="middle" fill="#fff" font-size="18" font-family="Arial, sans-serif" dy=".3em">TM</text>
          </svg>
        </div>
        <h2 class="form-title">Iniciar Sesión</h2>
        <form (ngSubmit)="onSubmit()" [formGroup]="loginForm" autocomplete="off">
          <div class="form-group">
            <label for="username">Usuario</label>
            <div class="input-icon-group">
              <span class="input-icon">
                <svg width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </span>
              <input id="username" type="text" formControlName="username" placeholder="Usuario" [class.invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" />
            </div>
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="error-message">
              El usuario es obligatorio.
            </div>
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-icon-group">
              <span class="input-icon">
                <svg width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6V9a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zm-8-2a4 4 0 1 1 8 0v2H8V9z"/></svg>
              </span>
              <input id="password" type="password" formControlName="password" placeholder="Contraseña" [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
            </div>
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              La contraseña es obligatoria.
            </div>
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="loginForm.invalid || loading">
            <span *ngIf="!loading">Entrar</span>
            <span *ngIf="loading">Entrando...</span>
          </button>
        </form>
        <div class="form-link">
          ¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en el login:', error);
          // Aquí podrías mostrar un mensaje de error
          this.loading = false;
        }
      });
    }
  }
} 