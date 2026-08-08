import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoanService } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-detail',
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
        <button mat-button color="primary" routerLink="/loans">
          <mat-icon>arrow_back</mat-icon> Volver a mis préstamos
        </button>
      </div>

      <h1 class="text-2xl font-bold mb-4">Detalle del Préstamo</h1>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando información del préstamo...</p>
      </div>

      <div *ngIf="!isLoading && loan">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{loan.bookTitle}}</mat-card-title>
            <mat-card-subtitle>
              <span [ngClass]="{
                'text-green-600': loan.status === 'ACTIVE',
                'text-red-600': loan.status === 'OVERDUE',
                'text-gray-600': loan.status === 'RETURNED'
              }">
                {{getStatusText(loan.status)}}
              </span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 class="text-lg font-semibold mb-2">Información del libro</h3>
                <p><strong>Título:</strong> {{loan.bookTitle}}</p>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Información del préstamo</h3>
                <p><strong>ID de préstamo:</strong> {{loan.id}}</p>
                <p><strong>Estado:</strong> {{getStatusText(loan.status)}}</p>
                <p><strong>Fecha de préstamo:</strong> {{loan.loanDate | date:'dd/MM/yyyy'}}</p>
                <p><strong>Fecha de devolución:</strong>
                  <span [ngClass]="{'text-red-600': loan.overdue}">
                    {{loan.dueDate | date:'dd/MM/yyyy'}}
                    <mat-icon *ngIf="loan.overdue" class="text-red-600 text-sm align-middle ml-1">warning</mat-icon>
                  </span>
                </p>
                <p *ngIf="loan.returnDate"><strong>Fecha de entrega:</strong> {{loan.returnDate | date:'dd/MM/yyyy'}}</p>
                <p *ngIf="loan.renewedCount !== undefined"><strong>Renovaciones realizadas:</strong> {{loan.renewedCount}}</p>
              </div>
            </div>

            <mat-divider class="my-4"></mat-divider>

            <div *ngIf="loan.status === 'ACTIVE'" class="bg-blue-50 p-4 rounded-md">
              <p class="text-blue-800">
                <mat-icon class="align-middle mr-2">info</mat-icon>
                Tu préstamo está activo. Por favor, devuelve el libro antes de la fecha de vencimiento.
              </p>
              <p *ngIf="canRenew()" class="mt-2 text-blue-800">
                <mat-icon class="align-middle mr-2">autorenew</mat-icon>
                Puedes renovar este préstamo para extender el período de devolución.
              </p>
            </div>

            <div *ngIf="loan.status === 'OVERDUE'" class="bg-red-50 p-4 rounded-md">
              <p class="text-red-800">
                <mat-icon class="align-middle mr-2">warning</mat-icon>
                Este préstamo está vencido. Por favor, devuelve el libro lo antes posible para evitar multas adicionales.
              </p>
              <p *ngIf="loan.fineId" class="mt-2 text-red-800">
                <mat-icon class="align-middle mr-2">attach_money</mat-icon>
                Multa actual: {{loan.fineAmount | currency}}
              </p>
            </div>

            <div *ngIf="loan.status === 'RETURNED'" class="bg-green-50 p-4 rounded-md">
              <p class="text-green-800">
                <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                Este libro ha sido devuelto correctamente.
              </p>
              <p *ngIf="loan.fineId && loan.fineStatus === 'PAID'" class="mt-2 text-green-800">
                <mat-icon class="align-middle mr-2">attach_money</mat-icon>
                Multa pagada: {{loan.fineAmount | currency}}
              </p>
              <p *ngIf="loan.fineId && loan.fineStatus === 'PENDING'" class="mt-2 text-red-800">
                <mat-icon class="align-middle mr-2">attach_money</mat-icon>
                Multa pendiente: {{loan.fineAmount | currency}}
                <a [routerLink]="['/fines', loan.fineId]" class="ml-2 underline">Ver detalles</a>
              </p>
            </div>
          </mat-card-content>

          <mat-card-actions class="p-4">
            <button mat-raised-button color="primary" [routerLink]="['/catalog', loan.bookId]">
              Ver detalles del libro
            </button>
            <button mat-button color="accent"
                    *ngIf="(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && canRenew()"
                    [disabled]="isRenewing"
                    (click)="renewLoan()">
              <mat-icon>autorenew</mat-icon> Renovar préstamo
            </button>
            <button mat-button color="warn"
                    *ngIf="loan.fineId && loan.fineStatus === 'PENDING'"
                    [routerLink]="['/fines', loan.fineId, 'pay']">
              <mat-icon>payment</mat-icon> Pagar multa
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !loan" class="text-center py-8">
        <p class="text-gray-500">No se encontró el préstamo solicitado</p>
        <button mat-raised-button color="primary" routerLink="/loans" class="mt-4">
          Volver a mis préstamos
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class LoanDetailComponent implements OnInit {
  loan: any = null;
  loanId: number = 0;
  isLoading = true;
  isRenewing = false;

  constructor(
    private route: ActivatedRoute,
    private loanService: LoanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loanId = +params['id'];
      this.loadLoan();
    });
  }

  loadLoan(): void {
    this.isLoading = true;
    this.loanService.getLoanById(this.loanId).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.isLoading = false;
      },
      error: () => {
        this.loan = null;
        this.isLoading = false;
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'ACTIVE': 'Activo',
      'OVERDUE': 'Vencido',
      'RETURNED': 'Devuelto'
    };
    return statusMap[status] || status;
  }

  canRenew(): boolean {
    return this.loan && (this.loan.renewedCount ?? 0) < 3;
  }

  renewLoan(): void {
    if (!this.loan || this.isRenewing) {
      return;
    }

    this.isRenewing = true;
    this.loanService.renewLoan(this.loanId).subscribe({
      next: (updated) => {
        this.isRenewing = false;
        this.loan = updated;
        this.snackBar.open('Préstamo renovado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.isRenewing = false;
        const message = err?.error?.message || 'No se pudo renovar el préstamo';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
