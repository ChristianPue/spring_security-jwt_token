import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';

export interface Notification {
  type: 'success' | 'error' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: message,
      confirmButtonColor: '#2563eb',
      timer: 2500,
      timerProgressBar: true
    });
    this.show({ type: 'success', message });
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#e53e3e',
    });
    this.show({ type: 'error', message });
  }

  showWarning(message: string) {
    this.show({ type: 'warning', message });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
    setTimeout(() => {
      this.clear();
    }, 5000);
  }

  clear() {
    this.notificationSubject.next(null);
  }
} 