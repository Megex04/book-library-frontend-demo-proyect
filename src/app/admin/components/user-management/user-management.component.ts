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

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
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
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  dataSource: User[] = [];
  searchTerm: string = '';
  filteredData: User[] = [];

  constructor() { }

  ngOnInit(): void {
    // Simular datos de usuarios (reemplazar con llamada a API real)
    this.dataSource = [
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        role: 'Administrador',
        status: 'Activo',
        lastLogin: '2023-06-15 10:30',
        createdAt: '2023-01-10'
      },
      {
        id: 2,
        name: 'María López',
        email: 'maria.lopez@example.com',
        role: 'Bibliotecario',
        status: 'Activo',
        lastLogin: '2023-06-14 14:45',
        createdAt: '2023-02-05'
      },
      {
        id: 3,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        role: 'Usuario',
        status: 'Inactivo',
        lastLogin: '2023-05-20 09:15',
        createdAt: '2023-03-12'
      },
      {
        id: 4,
        name: 'Ana Martínez',
        email: 'ana.martinez@example.com',
        role: 'Usuario',
        status: 'Activo',
        lastLogin: '2023-06-10 16:20',
        createdAt: '2023-01-25'
      },
      {
        id: 5,
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@example.com',
        role: 'Bibliotecario',
        status: 'Activo',
        lastLogin: '2023-06-13 11:05',
        createdAt: '2023-04-08'
      }
    ];
    this.filteredData = [...this.dataSource];
  }

  applyFilter(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.dataSource.filter(user => 
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.role.toLowerCase().includes(searchTermLower) ||
      user.status.toLowerCase().includes(searchTermLower)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredData = [...this.dataSource];
  }

  addUser(): void {
    // Implementar lógica para abrir diálogo de creación de usuario
    console.log('Agregar usuario');
  }

  editUser(user: User): void {
    // Implementar lógica para abrir diálogo de edición de usuario
    console.log('Editar usuario', user);
  }

  deleteUser(user: User): void {
    // Implementar lógica para confirmar y eliminar usuario
    console.log('Eliminar usuario', user);
  }

  viewUserDetails(user: User): void {
    // Implementar lógica para ver detalles del usuario
    console.log('Ver detalles del usuario', user);
  }

  getStatusClass(status: string): string {
    return status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }

  getRoleClass(role: string): string {
    switch(role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Bibliotecario':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}