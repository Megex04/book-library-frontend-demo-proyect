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
import { UserService } from '../../../core/services/user.service';

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
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  // El backend (UserDTO) no expone "lastLogin"; se quita esa columna del
  // listado real (existía solo en los datos simulados).
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource: any[] = [];
  searchTerm: string = '';
  isLoading = true;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = (response?.content ?? []).map((u: any) => this.normalizeUser(u));
        this.totalElements = response?.totalElements ?? this.dataSource.length;
        this.isLoading = false;
      },
      error: () => {
        this.dataSource = [];
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar los usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // El backend devuelve firstName/lastName por separado y roles como
  // Set<String> (ej. ["ROLE_ADMIN"]); se aplanan a los campos que usa la
  // plantilla (name, role) conservando el objeto original para las acciones.
  private normalizeUser(user: any): any {
    const roleNames: string[] = Array.isArray(user.roles) ? user.roles : [];
    const primaryRole = roleNames[0]?.replace('ROLE_', '') ?? 'USER';
    return {
      ...user,
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      role: primaryRole,
      status: user.enabled ? 'Activo' : 'Inactivo'
    };
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  get filteredData(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return this.dataSource;
    }
    return this.dataSource.filter(user =>
      (user.name ?? '').toLowerCase().includes(term) ||
      (user.email ?? '').toLowerCase().includes(term) ||
      (user.role ?? '').toLowerCase().includes(term) ||
      (user.status ?? '').toLowerCase().includes(term)
    );
  }

  applyFilter(): void {
    // Filtro en cliente sobre la página cargada.
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  addUser(): void {
    this.snackBar.open('Los usuarios se registran desde la pantalla de registro pública', 'Cerrar', { duration: 4000 });
  }

  editUser(user: any): void {
    // El backend solo permite editar firstName/lastName/phone (PUT /admin/users/{id})
    // desde este flujo; no hay formulario todavía, así que se deja como pendiente
    // explícito en vez de simular una edición que no ocurre de verdad.
    this.snackBar.open('La edición de usuarios se implementará próximamente', 'Cerrar', { duration: 3000 });
  }

  toggleUserStatus(user: any): void {
    const newStatus = !user.enabled;
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.snackBar.open(newStatus ? 'Usuario habilitado' : 'Usuario deshabilitado', 'Cerrar', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo actualizar el estado del usuario';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  deleteUser(user: any): void {
    const confirmed = window.confirm(`¿Eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo eliminar el usuario';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewUserDetails(user: any): void {
    this.snackBar.open(`${user.name} · ${user.email} · Préstamos activos: ${user.activeLoansCount ?? 0} · Multas pendientes: ${user.pendingFinesCount ?? 0}`, 'Cerrar', { duration: 5000 });
  }

  getStatusClass(status: string): string {
    return status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'LIBRARIAN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}
