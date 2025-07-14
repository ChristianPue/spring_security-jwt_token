import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../../services/task.service';
import { DeveloperService } from '../../../../services/developer.service';
import { NotificationService } from '../../../../services/notification.service';
import { TaskRequest, TaskResponse } from '../../../../models/task.model';
import { DeveloperResponse } from '../../../../models/developer.model';
import Swal from 'sweetalert2';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="task-form-container">
      <h2 class="title">{{ isEdit ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-group">
          <label for="title">Título</label>
          <input id="title" formControlName="title" type="text" [class.error]="isInvalid('title')" />
          @if (isInvalid('title')) {
            <div class="form-error">
              El título es obligatorio.
            </div>
          }
        </div>
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" [class.error]="isInvalid('description')"></textarea>
          @if (isInvalid('description')) {
            <div class="form-error">
              La descripción es obligatoria.
            </div>
          }
        </div>
        <div class="form-group">
          <label for="developerId">Desarrollador</label>
          <select id="developerId" formControlName="developerId" [class.error]="isInvalid('developerId')">
            <option value="">Seleccione un desarrollador</option>
            @for (dev of developers; track dev.id) {
              <option [ngValue]="dev.id">{{ dev.name }}</option>
            }
          </select>
          @if (isInvalid('developerId')) {
            <div class="form-error">
              Debe seleccionar un desarrollador.
            </div>
          }
        </div>
        <div class="form-group">
          <label for="startDate">Fecha de inicio</label>
          <input id="startDate" formControlName="startDate" type="date" [min]="today" [class.error]="isInvalid('startDate')" />
          @if (isInvalid('startDate')) {
            <div class="form-error">
              La fecha de inicio es obligatoria y debe ser desde hoy en adelante.
            </div>
          }
        </div>
        <div class="form-group">
          <label for="endDate">Fecha de fin</label>
          <input id="endDate" formControlName="endDate" type="date" [min]="taskForm.get('startDate')?.value || today" [class.error]="isInvalid('endDate')" />
          @if (isInvalid('endDate')) {
            <div class="form-error">
              La fecha de fin es obligatoria y debe ser igual o posterior a la de inicio.
            </div>
          }
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  developers: DeveloperResponse[] = [];
  isEdit = false;
  taskId: number | null = null;
  today = new Date().toISOString().split('T')[0];
  task: TaskResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private developerService: DeveloperService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.taskId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEdit = !!this.taskId;
    this.initForm();
    this.loadDevelopers(() => {
      if (this.isEdit) {
        this.loadTask();
      }
    });
  }

  initForm() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      developerId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateValidator });
  }

  dateValidator(form: FormGroup) {
    const start = form.get('startDate')?.value;
    const end = form.get('endDate')?.value;
    if (start && end && end < start) {
      return { dateInvalid: true };
    }
    return null;
  }

  isInvalid(control: string): boolean {
    const ctrl = this.taskForm.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  loadDevelopers(callback?: () => void) {
    this.developerService.getAll().subscribe({
      next: (devs) => {
        this.developers = devs;
        if (callback) callback();
      },
      error: (err) => this.showError(err)
    });
  }

  loadTask() {
    if (!this.taskId) return;
    this.taskService.getById(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          developerId: task.id,
          startDate: task.startDate,
          endDate: task.endDate
        });
      },
      error: (err) => this.showError(err)
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor complete todos los campos correctamente.', 'error');
      return;
    }
    const data: TaskRequest = this.taskForm.value;
    if (this.isEdit && this.taskId) {
      this.taskService.update(this.taskId, data).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'La tarea fue actualizada correctamente.', 'success');
          this.router.navigate(['/tasks']);
        },
        error: (err) => this.showError(err)
      });
    } else {
      this.taskService.create(data).subscribe({
        next: () => {
          Swal.fire('Creado', 'La tarea fue creada correctamente.', 'success');
          this.router.navigate(['/tasks']);
        },
        error: (err) => this.showError(err)
      });
    }
  }

  cancel() {
    this.router.navigate(['/tasks']);
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