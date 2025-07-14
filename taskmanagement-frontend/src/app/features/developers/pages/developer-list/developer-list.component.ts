import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeveloperService } from '../../../../services/developer.service';
import { DeveloperResponse } from '../../../../models/developer.model';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-developer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="developer-list-container">
      <div class="container">
        <div class="header">
          <h1>Desarrolladores</h1>
          <button class="btn-primary" (click)="goToCreate()">
            <i class="fas fa-plus"></i> Nuevo Desarrollador
          </button>
        </div>

        <div class="filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="filterDevelopers()"
              placeholder="Buscar desarrollador..."
            >
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let developer of filteredDevelopers">
                <td>{{ developer.id }}</td>
                <td>{{ developer.name }}</td>
                <td class="actions">
                  <button class="btn-icon" (click)="goToEdit(developer)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-icon delete" (click)="deleteDeveloper(developer.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./developer-list.component.css']
})
export class DeveloperListComponent implements OnInit {
  developers: DeveloperResponse[] = [];
  filteredDevelopers: DeveloperResponse[] = [];
  searchTerm: string = '';
  statusFilter: string = '';

  constructor(private developerService: DeveloperService, private router: Router) {}

  ngOnInit() {
    this.loadDevelopers();
  }

  loadDevelopers() {
    this.developerService.getAll().subscribe({
      next: (developers) => {
        this.developers = developers;
        this.filterDevelopers();
      },
      error: (error) => console.error('Error loading developers:', error)
    });
  }

  filterDevelopers() {
    this.filteredDevelopers = this.developers.filter(developer => {
      const matchesSearch = !this.searchTerm || 
        developer.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  getActiveTasksCount(developerId: number): number {
    return 0; // TODO: Implementar contador de tareas activas
  }

  goToCreate() {
    this.router.navigate(['/developers/new']);
  }

  goToEdit(developer: DeveloperResponse) {
    this.router.navigate(['/developers/edit', developer.id]);
  }

  deleteDeveloper(id: number) {
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
        this.developerService.delete(id).subscribe({
          next: () => {
            this.developers = this.developers.filter(developer => developer.id !== id);
            this.filterDevelopers();
            Swal.fire('Eliminado', 'El desarrollador fue eliminado correctamente.', 'success');
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo eliminar el desarrollador.', 'error');
            console.error('Error deleting developer:', error);
          }
        });
      }
    });
  }
} 