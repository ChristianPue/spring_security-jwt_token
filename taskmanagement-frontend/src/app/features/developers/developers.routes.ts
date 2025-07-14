import { Routes } from '@angular/router';

export const DEVELOPERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/developer-list/developer-list.component').then(m => m.DeveloperListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/developer-form/developer-form.component').then(m => m.DeveloperFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/developer-form/developer-form.component').then(m => m.DeveloperFormComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./pages/developer-upload/developer-upload.component').then(m => m.DeveloperUploadComponent)
  }
]; 