import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Mis Reservas</h1>

      <mat-card class="mb-4">
        <mat-card-content>
          <div *ngIf="!isLoading && reservations.length === 0" class="text-center py-8">
            <p class="text-gray-500">No tienes reservas activas</p>
            <button mat-raised-button color="primary" routerLink="/catalog" class="mt-4">
              Explorar catálogo
            </button>
          </div>

          <table mat-table [dataSource]="reservations" matSort *ngIf="reservations.length > 0" class="w-full">
            <!-- Book Column -->
            <ng-container matColumnDef="book">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Libro</th>
              <td mat-cell *matCellDef="let reservation">{{reservation.bookTitle}}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let reservation">
                <span [ngClass]="{
                  'text-green-600': reservation.status === 'READY',
                  'text-yellow-600': reservation.status === 'PENDING',
                  'text-gray-600': reservation.status === 'COMPLETED',
                  'text-red-600': reservation.status === 'CANCELLED' || reservation.status === 'EXPIRED'
                }">
                  {{getStatusText(reservation.status)}}
                </span>
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha de reserva</th>
              <td mat-cell *matCellDef="let reservation">{{reservation.reservationDate | date:'dd/MM/yyyy'}}</td>
            </ng-container>

            <!-- Expiration Column -->
            <ng-container matColumnDef="expiration">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha de expiración</th>
              <td mat-cell *matCellDef="let reservation">{{reservation.expiryDate | date:'dd/MM/yyyy'}}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let reservation">
                <button mat-icon-button color="primary" [routerLink]="['/reservations', reservation.id]">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="cancelReservation(reservation.id)"
                        *ngIf="reservation.status === 'PENDING' || reservation.status === 'READY'">
                  <mat-icon>cancel</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25]"
                         showFirstLastButtons
                         *ngIf="reservations.length > 0">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    table {
      width: 100%;
    }

    .mat-column-actions {
      width: 120px;
    }
  `]
})
export class ReservationListComponent implements OnInit {
  reservations: any[] = [];
  displayedColumns: string[] = ['book', 'status', 'date', 'expiration', 'actions'];
  isLoading = true;

  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (response) => {
        this.reservations = response ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar tus reservas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Pendiente',
      'READY': 'Lista para retirar',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'EXPIRED': 'Expirada'
    };
    return statusMap[status] || status;
  }

  cancelReservation(id: number): void {
    this.reservationService.cancelReservation(id).subscribe({
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
}
