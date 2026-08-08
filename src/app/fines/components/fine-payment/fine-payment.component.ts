import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FineService } from '../../../core/services/fine.service';

@Component({
  selector: 'app-fine-payment',
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
        <button mat-button color="primary" [routerLink]="['/fines', fineId]">
          <mat-icon>arrow_back</mat-icon> Volver al detalle de la multa
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">Pago de Multa</h1>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando información de la multa...</p>
      </div>

      <div *ngIf="!isLoading && fine">
        <mat-card class="mb-6">
          <mat-card-header>
            <mat-card-title>Resumen de la multa</mat-card-title>
          </mat-card-header>

          <mat-card-content class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>ID de multa:</strong> {{fine.id}}</p>
                <p><strong>Libro:</strong> {{fine.bookTitle}}</p>
              </div>

              <div>
                <p><strong>Monto a pagar:</strong> <span class="text-xl font-bold text-red-600">{{fine.amount | currency}}</span></p>
                <p><strong>Días de retraso:</strong> {{fine.daysOverdue}}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="fine.status === 'PENDING'">
          <mat-card-content class="p-4">
            <div class="bg-blue-50 p-4 rounded-md">
              <p class="text-blue-800">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                El pago en línea de multas todavía no está disponible en el sistema. Para pagar esta multa,
                acércate al mostrador de la biblioteca con tu ID de multa
                (<strong>#{{fine.id}}</strong>).
              </p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="fine.status !== 'PENDING'">
          <mat-card-content class="p-4">
            <div class="bg-green-50 p-4 rounded-md">
              <p class="text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                Esta multa ya no está pendiente de pago (estado: {{getStatusText(fine.status)}}).
              </p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !fine" class="text-center py-8">
        <p class="text-gray-500">No se encontró la multa solicitada</p>
        <button mat-raised-button color="primary" routerLink="/fines" class="mt-4">
          Volver a mis multas
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class FinePaymentComponent implements OnInit {
  fine: any = null;
  fineId: number = 0;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fineService: FineService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.fineId = +params['id'];
      this.loadFine();
    });
  }

  loadFine(): void {
    this.isLoading = true;
    this.fineService.getFineById(this.fineId).subscribe({
      next: (fine) => {
        this.fine = fine;
        this.isLoading = false;
      },
      error: () => {
        this.fine = null;
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagada',
      'WAIVED': 'Condonada'
    };
    return statusMap[status] || status;
  }

  navigateToFines(): void {
    this.router.navigate(['/fines']);
  }
}
