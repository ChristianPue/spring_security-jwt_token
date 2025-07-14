import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TaskService } from '../../../../services/task.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskResponse } from '../../../../models/task.model';
import { DeveloperService } from '../../../../services/developer.service';
import { DeveloperResponse } from '../../../../models/developer.model';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="task-list-container">
      <div class="task-list-header">
        <h1>Gestión de Tareas</h1>
        <div class="task-list-actions">
          <a routerLink="/tasks/new" class="btn btn-primary">Nueva Tarea</a>
          <a routerLink="/tasks/upload" class="btn btn-secondary">Importar Excel</a>
        </div>
      </div>
      <div class="task-list-filters">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar tareas..." 
            [(ngModel)]="searchTerm"
            (input)="filterTasks()"
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="filterTasks()">
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completadas</option>
          </select>
        </div>
        <div class="filter-group">
          <input type="date" [(ngModel)]="startDateFilter" (change)="filterTasks()" placeholder="Fecha inicio" />
        </div>
        <div class="filter-group">
          <input type="date" [(ngModel)]="endDateFilter" (change)="filterTasks()" placeholder="Fecha fin" />
        </div>
        <button (click)="clearFilters()" class="btn btn-secondary">Limpiar filtros</button>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Desarrollador</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (task of paginatedTasks(); track task.id) {
              <tr>
                <td>{{ task.title }}</td>
                <td>{{ task.description }}</td>
                <td>
                  <span class="status-badge" [class]="task.status.toLowerCase()">
                    {{ task.status }}
                  </span>
                </td>
                <td>{{ task.developerName || 'Sin asignar' }}</td>
                <td>{{ task.startDate | date:'short' }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/tasks/edit', task.id]" class="btn btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </a>
                  <button (click)="deleteTask(task.id)" class="btn btn-icon btn-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="pagination-btn" [class.active]="currentPage === 1" (click)="goToPage(1)">&laquo;</button>
        <button class="pagination-btn" *ngFor="let page of pagesArray()" [class.active]="currentPage === page" (click)="goToPage(page)">{{ page }}</button>
        <button class="pagination-btn" [class.active]="currentPage === totalPages" (click)="goToPage(totalPages)">&raquo;</button>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: TaskResponse[] = [];
  filteredTasks: TaskResponse[] = [];
  searchTerm: string = '';
  statusFilter: string = '';
  startDateFilter: string = '';
  endDateFilter: string = '';
  // Paginación
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 1;

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService,
    private developerService: DeveloperService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getAll().subscribe({
      next: (tasks) => {
        this.tasks = Array.isArray(tasks) ? tasks : tasks.content;
        this.filterTasks();
      },
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !this.searchTerm ||
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || task.status === this.statusFilter;
      const matchesStartDate = !this.startDateFilter || new Date(task.startDate) >= new Date(this.startDateFilter);
      const matchesEndDate = !this.endDateFilter || new Date(task.startDate) <= new Date(this.endDateFilter);
      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });
    this.currentPage = 1;
    this.updatePagination();
  }

  paginatedTasks() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTasks.slice(start, start + this.pageSize);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.pageSize) || 1;
  }

  pagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  goToCreate() {
    this.router.navigate(['/tasks/new']);
  }

  goToEdit(task: TaskResponse) {
    this.router.navigate(['/tasks/edit', task.id]);
  }

  deleteTask(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.delete(id).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.filterTasks();
            Swal.fire('Eliminado', 'La tarea fue eliminada correctamente.', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar la tarea.', 'error');
            console.error('Error deleting task:', error);
          }
        });
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.filterTasks();
  }
} 