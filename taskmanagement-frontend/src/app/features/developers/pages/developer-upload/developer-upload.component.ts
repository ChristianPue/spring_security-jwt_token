import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeveloperService } from '../../../../services/developer.service';
import { NotificationService } from '../../../../services/notification.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-developer-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Cargar Desarrolladores desde Excel</h2>
        <a routerLink="/developers" class="btn btn-secondary">
          Volver a Desarrolladores
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

        <div *ngIf="selectedFile" class="mt-4">
          <p class="mb-2">Archivo seleccionado: {{ selectedFile.name }}</p>
          <button (click)="uploadFile()" class="btn btn-primary" [disabled]="uploading">
            {{ uploading ? 'Subiendo...' : 'Subir Archivo' }}
          </button>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./developer-upload.component.css']
})
export class DeveloperUploadComponent {
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private developerService: DeveloperService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
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
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.developerService.uploadExcel(formData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Desarrolladores importados correctamente');
        setTimeout(() => {
          this.router.navigate(['/developers']);
        }, 2000);
      },
      error: (error) => {
        this.notificationService.showError('Error al importar desarrolladores: ' + error.message);
        this.uploading = false;
      }
    });
  }
} 