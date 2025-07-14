import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a [routerLink]="isAuthenticated() ? '/dashboard' : '/'" class="navbar-logo">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>TaskManager</span>
        </a>
        
        @if (isAuthenticated()) {
          <div class="navbar-links">
            <a routerLink="/dashboard" class="navbar-link" routerLinkActive="active">Dashboard</a>
            <a routerLink="/tasks" class="navbar-link" routerLinkActive="active">Tareas</a>
            <a routerLink="/developers" class="navbar-link" routerLinkActive="active">Desarrolladores</a>
          </div>
          <div class="navbar-user">
            <span class="navbar-user-name">{{ getUserName() }}</span>
            <button class="navbar-logout" (click)="logout()">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        } @else {
          <div class="navbar-links">
            <a href="#testimonio" class="navbar-link" (click)="scrollToSection($event, 'testimonio')">Testimonio</a>
            <a href="#sobre-nosotros" class="navbar-link" (click)="scrollToSection($event, 'sobre-nosotros')">Sobre Nosotros</a>
            <a href="#equipo" class="navbar-link" (click)="scrollToSection($event, 'equipo')">Creador</a>
            <button class="menu-btn" routerLink="/auth/login">Iniciar Sesión</button>
            <button class="cta-btn" routerLink="/auth/register">Registrarse</button>
          </div>
        }
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserName(): string {
    return localStorage.getItem('username') || 'Usuario';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
  }

  scrollToSection(event: Event, id: string) {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
} 