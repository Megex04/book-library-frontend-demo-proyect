import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { FineService } from '../../../core/services/fine.service';

@Component({
  selector: 'app-fine-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Mis Multas</h1>

      <mat-card class="mb-4">
        <mat-card-content>
          <div *ngIf="isLoading" class="text-center py-8">
            <p class="text-gray-500">Cargando multas...</p>
          </div>

          <div *ngIf="!isLoading && fines.length === 0" class="text-center py-8">
            <p class="text-gray-500">No tienes multas pendientes</p>
            <button mat-raised-button color="primary" routerLink="/loans" class="mt-4">
              Ver mis préstamos
            </button>
          </div>

          <table mat-table [dataSource]="fines" *ngIf="!isLoading && fines.length > 0" class="w-full">
            <ng-container matColumnDef="book">
              <th mat-header-cell *matHeaderCellDef>Libro</th>
              <td mat-cell *matCellDef="let fine">{{fine.bookTitle}}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Monto</th>
              <td mat-cell *matCellDef="let fine">{{fine.amount | currency}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let fine">
                <span [ngClass]="{
                  'text-red-600': fine.status === 'PENDING',
                  'text-green-600': fine.status === 'PAID',
                  'text-gray-600': fine.status === 'WAIVED'
                }">
                  {{getStatusText(fine.status)}}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="daysOverdue">
              <th mat-header-cell *matHeaderCellDef>Días de retraso</th>
              <td mat-cell *matCellDef="let fine">{{fine.daysOverdue}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let fine">
                <button mat-icon-button color="primary" [routerLink]="['/fines', fine.id]">
                  <mat-icon>visibility</mat-icon>
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
                         *ngIf="!isLoading && fines.length > 0"
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
      width: 80px;
    }
  `]
})
export class FineListComponent implements OnInit {
  fines: any[] = [];
  displayedColumns: string[] = ['book', 'amount', 'status', 'daysOverdue', 'actions'];
  isLoading = true;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(private fineService: FineService) {}

  ngOnInit(): void {
    this.loadFines();
  }

  loadFines(): void {
    this.isLoading = true;
    this.fineService.getMyFines(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.fines = response?.content ?? [];
        this.totalElements = response?.totalElements ?? this.fines.length;
        this.isLoading = false;
      },
      error: () => {
        this.fines = [];
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFines();
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
