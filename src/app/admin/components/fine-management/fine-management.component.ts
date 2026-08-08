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

interface Fine {
  id: number;
  userName: string;
  bookTitle: string;
  amount: number;
  reason: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

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
  displayedColumns: string[] = ['id', 'userName', 'bookTitle', 'amount', 'reason', 'issueDate', 'status', 'actions'];
  dataSource: Fine[] = [];
  searchTerm: string = '';
  filteredData: Fine[] = [];

  constructor() { }

  ngOnInit(): void {
    // Simular datos de multas (reemplazar con llamada a API real)
    this.dataSource = [
      {
        id: 1,
        userName: 'Juan Pérez',
        bookTitle: 'Cien años de soledad',
        amount: 5.00,
        reason: 'Retraso en devolución',
        issueDate: '2023-06-01',
        dueDate: '2023-06-15',
        status: 'Pendiente'
      },
      {
        id: 2,
        userName: 'María López',
        bookTitle: 'El principito',
        amount: 10.00,
        reason: 'Daño en libro',
        issueDate: '2023-05-20',
        dueDate: '2023-06-03',
        status: 'Pagada'
      },
      {
        id: 3,
        userName: 'Carlos Rodríguez',
        bookTitle: '1984',
        amount: 7.50,
        reason: 'Retraso en devolución',
        issueDate: '2023-05-15',
        dueDate: '2023-05-29',
        status: 'Pendiente'
      },
      {
        id: 4,
        userName: 'Ana Martínez',
        bookTitle: 'Don Quijote de la Mancha',
        amount: 15.00,
        reason: 'Libro perdido',
        issueDate: '2023-06-05',
        dueDate: '2023-06-19',
        status: 'Cancelada'
      },
      {
        id: 5,
        userName: 'Pedro Sánchez',
        bookTitle: 'Harry Potter y la piedra filosofal',
        amount: 3.50,
        reason: 'Retraso en devolución',
        issueDate: '2023-05-10',
        dueDate: '2023-05-24',
        status: 'Pagada'
      }
    ];
    this.filteredData = [...this.dataSource];
  }

  applyFilter(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.dataSource.filter(fine => 
      fine.userName.toLowerCase().includes(searchTermLower) ||
      fine.bookTitle.toLowerCase().includes(searchTermLower) ||
      fine.reason.toLowerCase().includes(searchTermLower) ||
      fine.status.toLowerCase().includes(searchTermLower)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredData = [...this.dataSource];
  }

  addFine(): void {
    // Implementar lógica para abrir diálogo de creación de multa
    console.log('Agregar multa');
  }

  editFine(fine: Fine): void {
    // Implementar lógica para abrir diálogo de edición de multa
    console.log('Editar multa', fine);
  }

  deleteFine(fine: Fine): void {
    // Implementar lógica para confirmar y eliminar multa
    console.log('Eliminar multa', fine);
  }

  markAsPaid(fine: Fine): void {
    // Implementar lógica para marcar multa como pagada
    console.log('Marcar como pagada', fine);
  }

  cancelFine(fine: Fine): void {
    // Implementar lógica para cancelar multa
    console.log('Cancelar multa', fine);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Pagada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2) + ' €';
  }
}