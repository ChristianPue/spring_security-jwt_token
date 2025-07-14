import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar (logout)="logout()"></app-navbar>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `
})
export class MainLayoutComponent {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  logout() {
    localStorage.removeItem('token');
    this.notificationService.showSuccess('Sesión cerrada correctamente');
    window.location.href = '/auth/login';
  }
} 