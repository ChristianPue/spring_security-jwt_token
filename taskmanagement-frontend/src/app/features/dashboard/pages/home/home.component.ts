import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../../../services/task.service';
import { DeveloperService } from '../../../../services/developer.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskResponse } from '../../../../models/task.model';
import { DeveloperResponse } from '../../../../models/developer.model';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="dashboard-actions">
          <a routerLink="/tasks/new" class="btn btn-primary">Nueva Tarea</a>
          <a routerLink="/developers/new" class="btn btn-secondary">Nuevo Desarrollador</a>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h2>Tareas Pendientes</h2>
          <div class="card-content">
            <div class="stat-number">{{ pendingTasks.length }}</div>
            <div class="stat-label">tareas</div>
          </div>
          <a routerLink="/tasks" class="card-link">Ver todas →</a>
        </div>

        <div class="dashboard-card">
          <h2>Desarrolladores Activos</h2>
          <div class="card-content">
            <div class="stat-number">{{ activeDevelopers.length }}</div>
            <div class="stat-label">desarrolladores</div>
          </div>
          <a routerLink="/developers" class="card-link">Ver todos →</a>
        </div>

        <div class="dashboard-card">
          <h2>Tareas en Progreso</h2>
          <div class="card-content">
            <div class="stat-number">{{ inProgressTasks.length }}</div>
            <div class="stat-label">tareas</div>
          </div>
          <a routerLink="/tasks" class="card-link">Ver todas →</a>
        </div>

        <div class="dashboard-card">
          <h2>Tareas Completadas</h2>
          <div class="card-content">
            <div class="stat-number">{{ completedTasks.length }}</div>
            <div class="stat-label">tareas</div>
          </div>
          <a routerLink="/tasks" class="card-link">Ver todas →</a>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>Últimas Tareas</h2>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Desarrollador</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              @for (task of recentTasks; track task.id) {
                <tr>
                  <td>{{ task.title }}</td>
                  <td>
                    <span class="status-badge" [class]="task.status.toLowerCase()">
                      {{ task.status }}
                    </span>
                  </td>
                  <td>{{ task.developerName || 'Sin asignar' }}</td>
                  <td>{{ task.startDate | date:'short' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tasks: TaskResponse[] = [];
  developers: DeveloperResponse[] = [];
  recentTasks: TaskResponse[] = [];

  constructor(
    private taskService: TaskService,
    private developerService: DeveloperService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadDevelopers();
  }

  loadTasks() {
    this.taskService.getAll().subscribe({
      next: (res) => {
        const tasks = Array.isArray(res) ? res : res.content;
        this.tasks = tasks;
        this.recentTasks = [...tasks]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar tareas: ' + error.message);
      }
    });
  }

  loadDevelopers() {
    this.developerService.getAll().subscribe({
      next: (developers) => {
        this.developers = developers;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar desarrolladores: ' + error.message);
      }
    });
  }

  get pendingTasks() {
    return this.tasks.filter(task => task.status === 'PENDING');
  }

  get inProgressTasks() {
    return this.tasks.filter(task => task.status === 'IN_PROGRESS');
  }

  get completedTasks() {
    return this.tasks.filter(task => task.status === 'COMPLETED');
  }

  get activeDevelopers() {
    return this.developers;
  }
} 