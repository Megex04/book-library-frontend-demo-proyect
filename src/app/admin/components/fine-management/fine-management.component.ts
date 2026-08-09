import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FineService } from '../../../core/services/fine.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-fine-management',
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
  templateUrl: './fine-management.component.html',
  styleUrls: ['./fine-management.component.scss']
})
export class FineManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  displayedColumns: string[] = ['id', 'userName', 'bookTitle', 'amount', 'daysOverdue', 'status', 'actions'];
  dataSource: any[] = [];
  searchTerm: string = '';
  isLoading = true;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private fineService: FineService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  // Condonar multas es hasRole('ADMIN') en el backend (FineController);
  // cobrar (pay) sí lo permite LIBRARIAN. El botón de condonar se oculta
  // para quien no sea ADMIN en vez de dejarlo visible y fallar con 403.
  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.loadFines();
  }

  loadFines(): void {
    this.isLoading = true;
    this.fineService.getAllFines(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = response?.content ?? [];
        this.totalElements = response?.totalElements ?? this.dataSource.length;
        this.isLoading = false;
      },
      error: () => {
        this.dataSource = [];
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar las multas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadFines();
  }

  get filteredData(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return this.dataSource;
    }
    return this.dataSource.filter(fine =>
      (fine.userName ?? '').toLowerCase().includes(term) ||
      (fine.bookTitle ?? '').toLowerCase().includes(term) ||
      (fine.status ?? '').toLowerCase().includes(term)
    );
  }

  applyFilter(): void {
    // Filtro en cliente sobre la página cargada.
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  addFine(): void {
    // El backend genera las multas automáticamente al procesar préstamos
    // vencidos; no existe un endpoint para crearlas manualmente.
    this.snackBar.open('Las multas se generan automáticamente por préstamos vencidos', 'Cerrar', { duration: 4000 });
  }

  markAsPaid(fine: any): void {
    this.fineService.payFine(fine.id).subscribe({
      next: () => {
        this.snackBar.open('Multa marcada como pagada', 'Cerrar', { duration: 3000 });
        this.loadFines();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo registrar el pago';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  waiveFine(fine: any): void {
    const confirmed = window.confirm(`¿Condonar la multa de ${fine.userName}? Esta acción no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.fineService.waiveFine(fine.id).subscribe({
      next: () => {
        this.snackBar.open('Multa condonada correctamente', 'Cerrar', { duration: 3000 });
        this.loadFines();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo condonar la multa';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'PAID':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'WAIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'PAID': 'Pagada',
      'WAIVED': 'Condonada'
    };
    return statusMap[status] || status;
  }

  formatCurrency(amount: number): string {
    return (amount ?? 0).toFixed(2) + ' €';
  }
}
