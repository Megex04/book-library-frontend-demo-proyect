import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FineService } from '../../../core/services/fine.service';

@Component({
  selector: 'app-fine-detail',
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
        <button mat-button color="primary" routerLink="/fines">
          <mat-icon>arrow_back</mat-icon> Volver a mis multas
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">Detalle de la Multa</h1>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando información de la multa...</p>
      </div>

      <div *ngIf="!isLoading && fine">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Multa #{{fine.id}}</mat-card-title>
            <mat-card-subtitle>
              <span [ngClass]="{
                'text-red-600': fine.status === 'PENDING',
                'text-green-600': fine.status === 'PAID',
                'text-gray-600': fine.status === 'WAIVED'
              }">
                {{getStatusText(fine.status)}}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">Información de la multa</h3>
                <p><strong>ID de multa:</strong> {{fine.id}}</p>
                <p><strong>Monto:</strong> {{fine.amount | currency}}</p>
                <p><strong>Estado:</strong> {{getStatusText(fine.status)}}</p>
                <p><strong>Días de retraso:</strong> {{fine.daysOverdue}}</p>
                <p *ngIf="fine.paymentDate"><strong>Fecha de pago:</strong> {{fine.paymentDate | date:'dd/MM/yyyy'}}</p>
                <p *ngIf="fine.notes"><strong>Notas:</strong> {{fine.notes}}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Información del préstamo</h3>
                <p><strong>ID de préstamo:</strong> {{fine.loanId}}</p>
                <p><strong>Libro:</strong> {{fine.bookTitle}}</p>
              </div>
            </div>

            <mat-divider class="my-4"></mat-divider>

            <div *ngIf="fine.status === 'PENDING'" class="bg-red-50 p-4 rounded-md">
              <p class="text-red-800">
                <mat-icon class="align-middle mr-2">warning</mat-icon>
                Esta multa está pendiente de pago. Por favor, realiza el pago lo antes posible para evitar restricciones en tu cuenta.
              </p>
            </div>

            <div *ngIf="fine.status === 'PAID'" class="bg-green-50 p-4 rounded-md">
              <p class="text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                Esta multa ha sido pagada correctamente.
              </p>
              <p *ngIf="fine.paymentDate" class="mt-2 text-green-800">
                <mat-icon class="align-middle mr-2">receipt</mat-icon>
                Fecha de pago: {{fine.paymentDate | date:'dd/MM/yyyy'}}
              </p>
            </div>

            <div *ngIf="fine.status === 'WAIVED'" class="bg-gray-50 p-4 rounded-md">
              <p class="text-gray-800">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                Esta multa fue condonada por la biblioteca.
              </p>
            </div>
          </mat-card-content>

          <mat-card-actions class="p-4">
            <button mat-raised-button color="primary" [routerLink]="['/loans', fine.loanId]">
              Ver detalles del préstamo
            </button>
          </mat-card-actions>
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
export class FineDetailComponent implements OnInit {
  fine: any = null;
  fineId: number = 0;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
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
}
