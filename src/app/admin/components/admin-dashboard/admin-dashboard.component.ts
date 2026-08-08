import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
  /*styleUrls: ['./admin-dashboard.component.css']*/
})
export class AdminDashboardComponent {
  // Estadísticas del sistema
  stats = {
    totalUsers: 1250,
    totalBooks: 8750,
    activeLoans: 342,
    pendingReservations: 128,
    overdueLoans: 45,
    unpaidFines: 23
  };

  // Actividad reciente
  recentActivity = [
    { type: 'user', action: 'Nuevo usuario registrado', name: 'María López', time: '10 minutos' },
    { type: 'book', action: 'Libro añadido', name: 'Cien años de soledad', time: '30 minutos' },
    { type: 'loan', action: 'Préstamo realizado', name: 'Juan Pérez - Don Quijote', time: '1 hora' },
    { type: 'fine', action: 'Multa pagada', name: 'Carlos Ruiz - $15.00', time: '2 horas' },
    { type: 'reservation', action: 'Reserva cancelada', name: 'Ana García - El principito', time: '3 horas' }
  ];

  constructor() { }
}