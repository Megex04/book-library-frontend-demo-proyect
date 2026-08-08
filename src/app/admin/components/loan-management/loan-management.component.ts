import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoanService } from '../../../core/services/loan.service';
import { LoanCreateDialogComponent } from './loan-create-dialog/loan-create-dialog.component';

@Component({
  selector: 'app-loan-management',
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
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.scss']
})
export class LoanManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  displayedColumns: string[] = ['id', 'bookTitle', 'userName', 'loanDate', 'dueDate', 'status', 'actions'];
  dataSource: any[] = [];
  searchTerm: string = '';
  isLoading = true;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;
  private searchStatus?: string;

  constructor(
    private loanService: LoanService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading = true;
    this.loanService.getAllLoans(this.searchStatus, this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = response?.content ?? [];
        this.totalElements = response?.totalElements ?? this.dataSource.length;
        this.isLoading = false;
      },
      error: () => {
        this.dataSource = [];
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar los préstamos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLoans();
  }

  applyFilter(): void {
    // Filtro simple en el cliente sobre la página cargada. Para buscar en
    // todo el conjunto habría que agregar un endpoint de búsqueda en backend.
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return;
    }
  }

  get filteredData(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return this.dataSource;
    }
    return this.dataSource.filter(loan =>
      (loan.bookTitle ?? '').toLowerCase().includes(term) ||
      (loan.userName ?? '').toLowerCase().includes(term) ||
      (loan.status ?? '').toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  addLoan(): void {
    const dialogRef = this.dialog.open(LoanCreateDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Préstamo creado correctamente', 'Cerrar', { duration: 3000 });
        this.loadLoans();
      }
    });
  }

  returnBook(loan: any): void {
    this.loanService.returnBook(loan.id).subscribe({
      next: () => {
        this.snackBar.open('Devolución registrada correctamente', 'Cerrar', { duration: 3000 });
        this.loadLoans();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo registrar la devolución';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  extendLoan(loan: any): void {
    this.loanService.renewLoan(loan.id).subscribe({
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'RETURNED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'LOST':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusText(status: string): string {
    const statusMap: {[key: string]: string} = {
      'ACTIVE': 'Activo',
      'OVERDUE': 'Vencido',
      'RETURNED': 'Devuelto',
      'LOST': 'Perdido'
    };
    return statusMap[status] || status;
  }
}
