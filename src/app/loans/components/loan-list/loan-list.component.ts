import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoanService } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-list',
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
      <h1 class="text-2xl font-bold mb-4">Mis Préstamos</h1>

      <mat-card class="mb-4">
        <mat-card-content>
          <div *ngIf="!isLoading && loans.length === 0" class="text-center py-8">
            <p class="text-gray-500">No tienes préstamos activos</p>
            <button mat-raised-button color="primary" routerLink="/catalog" class="mt-4">
              Explorar catálogo
            </button>
          </div>

          <table mat-table [dataSource]="loans" matSort *ngIf="loans.length > 0" class="w-full">
            <!-- Book Column -->
            <ng-container matColumnDef="book">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Libro</th>
              <td mat-cell *matCellDef="let loan">{{loan.bookTitle}}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let loan">
                <span [ngClass]="{
                  'text-green-600': loan.status === 'ACTIVE',
                  'text-red-600': loan.status === 'OVERDUE',
                  'text-gray-600': loan.status === 'RETURNED'
                }">
                  {{getStatusText(loan.status)}}
                </span>
              </td>
            </ng-container>

            <!-- Loan Date Column -->
            <ng-container matColumnDef="loanDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha de préstamo</th>
              <td mat-cell *matCellDef="let loan">{{loan.loanDate | date:'dd/MM/yyyy'}}</td>
            </ng-container>

            <!-- Due Date Column -->
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha de devolución</th>
              <td mat-cell *matCellDef="let loan" [ngClass]="{
                'text-red-600': loan.overdue
              }">
                {{loan.dueDate | date:'dd/MM/yyyy'}}
                <span *ngIf="loan.overdue" class="ml-2">
                  <mat-icon class="text-red-600 text-sm">warning</mat-icon>
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let loan">
                <button mat-icon-button color="primary" [routerLink]="['/loans', loan.id]">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent"
                        *ngIf="loan.status === 'ACTIVE' || loan.status === 'OVERDUE'"
                        (click)="renewLoan(loan.id)">
                  <mat-icon>autorenew</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25]"
                         [length]="totalElements"
                         [pageSize]="pageSize"
                         [pageIndex]="pageIndex"
                         showFirstLastButtons
                         *ngIf="loans.length > 0"
                         (page)="onPageChange($event)">
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
export class LoanListComponent implements OnInit {
  loans: any[] = [];
  displayedColumns: string[] = ['book', 'status', 'loanDate', 'dueDate', 'actions'];
  isLoading = true;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  constructor(
    private loanService: LoanService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading = true;
    this.loanService.getMyLoans(undefined, this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.loans = response?.content ?? [];
        this.totalElements = response?.totalElements ?? this.loans.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar tus préstamos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLoans();
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'ACTIVE': 'Activo',
      'OVERDUE': 'Vencido',
      'RETURNED': 'Devuelto'
    };
    return statusMap[status] || status;
  }

  renewLoan(id: number): void {
    this.loanService.renewLoan(id).subscribe({
      next: () => {
        this.snackBar.open('Préstamo renovado correctamente', 'Cerrar', { duration: 3000 });
        this.loadLoans();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo renovar el préstamo';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
