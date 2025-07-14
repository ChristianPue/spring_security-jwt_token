import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DeveloperService } from '../../../../services/developer.service';
import { DeveloperRequest, DeveloperResponse } from '../../../../models/developer.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="developer-form-container">
      <h2 class="title">{{ isEdit ? 'Editar Desarrollador' : 'Nuevo Desarrollador' }}</h2>
      <form [formGroup]="developerForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-group">
          <label for="name">Nombre</label>
          <input id="name" formControlName="name" type="text" [class.error]="isInvalid('name')" />
          @if (isInvalid('name')) {
            <div class="form-error">
              El nombre es obligatorio.
            </div>
          }
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="developerForm.invalid">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./developer-form.component.css']
})
export class DeveloperFormComponent implements OnInit {
  developerForm!: FormGroup;
  isEdit = false;
  developerId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private developerService: DeveloperService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.developerId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.developerId;
    this.initForm();
    if (this.isEdit) {
      this.loadDeveloper();
    }
  }

  initForm() {
    this.developerForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  isInvalid(control: string): boolean {
    const ctrl = this.developerForm.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  loadDeveloper() {
    if (!this.developerId) return;
    this.developerService.getById(this.developerId).subscribe({
      next: (dev) => {
        this.developerForm.patchValue({ name: dev.name });
      },
      error: (err) => this.showError(err)
    });
  }

  onSubmit() {
    if (this.developerForm.invalid) {
      this.developerForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor complete el nombre.', 'error');
      return;
    }
    const data: DeveloperRequest = this.developerForm.value;
    if (this.isEdit && this.developerId) {
      this.developerService.update(this.developerId, data).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'El desarrollador fue actualizado correctamente.', 'success');
          this.router.navigate(['/developers']);
        },
        error: (err) => this.showError(err)
      });
    } else {
      this.developerService.create(data).subscribe({
        next: () => {
          Swal.fire('Creado', 'El desarrollador fue creado correctamente.', 'success');
          this.router.navigate(['/developers']);
        },
        error: (err) => this.showError(err)
      });
    }
  }

  cancel() {
    this.router.navigate(['/developers']);
  }

  showError(error: any) {
    const msg =
      error?.error?.detail || // Para ProblemDetail de Spring
      error?.error?.message ||
      error?.message ||
      'Error inesperado';
    Swal.fire('Error', msg, 'error');
  }
} 