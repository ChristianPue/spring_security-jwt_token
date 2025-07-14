import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../../services/task.service';
import { NotificationService } from '../../../../services/notification.service';
import { HttpEventType } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-task-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Cargar Tareas desde Excel</h2>
        <a routerLink="/tasks" class="btn btn-secondary">
          Volver a Tareas
        </a>
      </div>

      <div class="card-body">
        <div class="file-upload" (click)="fileInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
          <input
            #fileInput
            type="file"
            accept=".xlsx,.xls"
            (change)="onFileSelected($event)"
          />
          <div class="text-center">
            <p class="mb-4">Arrastra y suelta un archivo Excel aquí o haz clic para seleccionar</p>
            <p class="text-sm text-gray-500">Formatos soportados: .xlsx, .xls</p>
          </div>
        </div>

        <div *ngIf="selectedFile" class="mt-4 file-selected-box">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <p class="mb-2" style="margin: 0;">Archivo seleccionado: {{ selectedFile.name }}</p>
            <button (click)="removeFile()" class="btn-x" aria-label="Eliminar archivo">✕</button>
          </div>
          <button (click)="uploadFile()" class="btn btn-primary" [disabled]="uploading">
            {{ uploading ? 'Subiendo...' : 'Subir Archivo' }}
          </button>
          <div *ngIf="uploading" class="progress-bar-container">
            <div class="progress-bar" [style.width]="progress + '%'">{{ progress }}%</div>
          </div>
        </div>
        <div *ngIf="uploadSuccess" class="custom-success-message mt-3">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M7 13l3 3 7-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>¡El archivo se cargó correctamente!</span>
        </div>
        <div *ngIf="uploading" class="loading-overlay">
          <div class="loading-content">
            <span class="loader"></span>
            <span class="loading-text">Cargando...</span>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./task-upload.component.css']
})
export class TaskUploadComponent {
  selectedFile: File | null = null;
  uploading = false;
  progress = 0;
  uploadSuccess = false;

  constructor(
    private taskService: TaskService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.uploadSuccess = false;
      this.progress = 0;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.uploadSuccess = false;
    this.progress = 0;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.selectedFile = files[0];
      this.uploadSuccess = false;
      this.progress = 0;
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.progress = 0;
    this.uploadSuccess = false;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.taskService.uploadExcel(formData).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.uploadSuccess = true;
          const msg = event.body || 'Tareas importadas correctamente';
          this.notificationService.showSuccess(msg);
          setTimeout(() => {
            this.router.navigate(['/tasks']);
          }, 2000);
        }
      },
      error: (error) => {
        this.uploading = false;
        let msg = 'Error al importar tareas';
        if (typeof error?.error === 'string') {
          try {
            const errObj = JSON.parse(error.error);
            msg = errObj.detail || errObj.message || errObj.title || msg;
          } catch {
            msg = error.error;
          }
        } else {
          msg = error?.error?.detail || error?.error?.message || error?.error || error?.message || msg;
        }
        this.notificationService.showError(msg);
        console.error('Error al importar tareas:', error);
      }
    });
  }
} 