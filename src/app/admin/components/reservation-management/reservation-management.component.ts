import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.scss']
})
export class ReservationManagementComponent implements OnInit {
  displayedColumns: string[] = ['id', 'bookTitle', 'userName', 'reservationDate', 'expiryDate', 'status', 'actions'];
  dataSource: any[] = [];
  searchTerm: string = '';
  isLoading = true;
  statusFilter?: string;

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.reservationService.getAllReservations(this.statusFilter).subscribe({
      next: (reservations) => {
        this.dataSource = reservations ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.dataSource = [];
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar las reservas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  get filteredData(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return this.dataSource;
    }
    return this.dataSource.filter(reservation =>
      (reservation.bookTitle ?? '').toLowerCase().includes(term) ||
      (reservation.userName ?? '').toLowerCase().includes(term) ||
      (reservation.status ?? '').toLowerCase().includes(term)
    );
  }

  applyFilter(): void {
    // Filtro en cliente sobre los datos ya cargados.
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  addReservation(): void {
    this.snackBar.open('Las reservas se crean desde el catálogo (los usuarios reservan sus propios libros)', 'Cerrar', { duration: 4000 });
  }

  processReservation(reservation: any): void {
    this.reservationService.processReservation(reservation.id).subscribe({
      next: () => {
        this.snackBar.open('Reserva marcada como lista para retirar', 'Cerrar', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo procesar la reserva';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  completeReservation(reservation: any): void {
    this.reservationService.completeReservation(reservation.id).subscribe({
      next: () => {
        this.snackBar.open('Reserva completada: préstamo creado correctamente', 'Cerrar', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo completar la reserva';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelReservation(reservation: any): void {
    const reason = window.prompt('Motivo de la cancelación:', 'Cancelada por el bibliotecario');
    if (reason === null) {
      return;
    }

    this.reservationService.cancelReservationByAdmin(reservation.id, reason).subscribe({
      next: () => {
        this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', { duration: 3000 });
        this.loadReservations();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo cancelar la reserva';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'READY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Pendiente',
      'READY': 'Lista para retirar',
      'COMPLETED': 'Completada',
      'EXPIRED': 'Expirada',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  }
}
