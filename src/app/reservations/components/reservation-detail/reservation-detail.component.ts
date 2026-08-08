import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4">
        <button mat-button color="primary" routerLink="/reservations">
          <mat-icon>arrow_back</mat-icon> Volver a mis reservas
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">Detalle de la Reserva</h1>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando información de la reserva...</p>
      </div>

      <div *ngIf="!isLoading && reservation">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{reservation.bookTitle}}</mat-card-title>
            <mat-card-subtitle>
              <span [ngClass]="{
                'text-green-600': reservation.status === 'READY',
                'text-yellow-600': reservation.status === 'PENDING',
                'text-red-600': reservation.status === 'CANCELLED' || reservation.status === 'EXPIRED',
                'text-gray-600': reservation.status === 'COMPLETED'
              }">
                {{getStatusText(reservation.status)}}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">Información del libro</h3>
                <p><strong>Título:</strong> {{reservation.bookTitle}}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Información de la reserva</h3>
                <p><strong>ID de reserva:</strong> {{reservation.id}}</p>
                <p><strong>Estado:</strong> {{getStatusText(reservation.status)}}</p>
                <p><strong>Fecha de reserva:</strong> {{reservation.reservationDate | date:'dd/MM/yyyy'}}</p>
                <p><strong>Fecha de expiración:</strong> {{reservation.expiryDate | date:'dd/MM/yyyy'}}</p>
              </div>
            </div>

            <mat-divider class="my-4"></mat-divider>

            <div *ngIf="reservation.status === 'READY'" class="bg-blue-50 p-4 rounded-md">
              <p class="text-blue-800">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                Tu reserva está lista. Por favor, recoge el libro en la biblioteca antes de la fecha de expiración.
              </p>
            </div>

            <div *ngIf="reservation.status === 'PENDING'" class="bg-yellow-50 p-4 rounded-md">
              <p class="text-yellow-800">
                <mat-icon class="align-middle mr-2">pending</mat-icon>
                Tu reserva está pendiente de confirmación. Te notificaremos cuando esté lista.
              </p>
            </div>

            <div *ngIf="reservation.status === 'CANCELLED'" class="bg-red-50 p-4 rounded-md">
              <p class="text-red-800">
                <mat-icon class="align-middle mr-2">cancel</mat-icon>
                Esta reserva ha sido cancelada.
              </p>
            </div>

            <div *ngIf="reservation.status === 'COMPLETED'" class="bg-green-50 p-4 rounded-md">
              <p class="text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                Esta reserva ha sido completada. El libro ha sido prestado.
              </p>
            </div>

            <div *ngIf="reservation.status === 'EXPIRED'" class="bg-gray-50 p-4 rounded-md">
              <p class="text-gray-800">
                <mat-icon class="align-middle mr-2">schedule</mat-icon>
                Esta reserva ha expirado porque no recogiste el libro a tiempo.
              </p>
            </div>
          </mat-card-content>

          <mat-card-actions class="p-4">
            <button mat-raised-button color="primary" [routerLink]="['/catalog', reservation.bookId]">
              Ver detalles del libro
            </button>
            <button mat-button color="warn" (click)="cancelReservation()"
                    [disabled]="isCancelling"
                    *ngIf="reservation.status === 'PENDING' || reservation.status === 'READY'">
              Cancelar reserva
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !reservation" class="text-center py-8">
        <p class="text-gray-500">No se encontró la reserva solicitada</p>
        <button mat-raised-button color="primary" routerLink="/reservations" class="mt-4">
          Volver a mis reservas
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ReservationDetailComponent implements OnInit {
  reservation: any = null;
  reservationId: number = 0;
  isLoading = true;
  isCancelling = false;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.reservationId = +params['id'];
      this.loadReservation();
    });
  }

  loadReservation(): void {
    // El backend no expone GET /api/reservations/{id}, así que buscamos la
    // reserva dentro del listado de "mis reservas" (sí existe y funciona).
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (reservations) => {
        this.reservation = (reservations || []).find((r: any) => r.id === this.reservationId) || null;
        this.isLoading = false;
      },
      error: () => {
        this.reservation = null;
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Pendiente',
      'READY': 'Lista para retirar',
      'CANCELLED': 'Cancelada',
      'COMPLETED': 'Completada',
      'EXPIRED': 'Expirada'
    };
    return statusMap[status] || status;
  }

  cancelReservation(): void {
    if (!this.reservation || this.isCancelling) {
      return;
    }

    this.isCancelling = true;
    this.reservationService.cancelReservation(this.reservationId).subscribe({
      next: (updated) => {
        this.isCancelling = false;
        this.reservation = updated;
        this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isCancelling = false;
        const message = err?.error?.message || 'No se pudo cancelar la reserva';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
