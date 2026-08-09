import { Routes } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';

// Roles por subsección, alineados con los @PreAuthorize de cada controller
// del backend:
// - UserController: CRUD de usuarios es hasRole('ADMIN') -> solo ADMIN.
// - BookController: crear/editar/inventario son hasAnyRole('LIBRARIAN','ADMIN') -> ambos.
// - LoanController: toda la gestión de préstamos es hasAnyRole('LIBRARIAN','ADMIN') -> ambos.
// - ReservationController: toda la gestión admin es hasAnyRole('LIBRARIAN','ADMIN') -> ambos.
// - FineController: ver/cobrar son hasAnyRole('LIBRARIAN','ADMIN'); condonar/stats son
//   hasRole('ADMIN'). La pantalla se deja accesible a ambos; los botones exclusivos
//   de ADMIN se ocultan dentro del propio componente.
// - Reportes: agregan estadísticas de todo el sistema (incluye stats de multas,
//   que en backend son ADMIN-only) -> solo ADMIN.
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
    title: 'Panel de administración - BiblioSystem'
  },
  {
    path: 'users',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/user-management/user-management.component').then(c => c.UserManagementComponent),
    title: 'Gestión de usuarios - BiblioSystem'
  },
  {
    path: 'books',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'LIBRARIAN'] },
    loadComponent: () => import('./components/book-management/book-management.component').then(c => c.BookManagementComponent),
    title: 'Gestión de libros - BiblioSystem'
  },
  {
    path: 'loans',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'LIBRARIAN'] },
    loadComponent: () => import('./components/loan-management/loan-management.component').then(c => c.LoanManagementComponent),
    title: 'Gestión de préstamos - BiblioSystem'
  },
  {
    path: 'reservations',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'LIBRARIAN'] },
    loadComponent: () => import('./components/reservation-management/reservation-management.component').then(c => c.ReservationManagementComponent),
    title: 'Gestión de reservas - BiblioSystem'
  },
  {
    path: 'fines',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'LIBRARIAN'] },
    loadComponent: () => import('./components/fine-management/fine-management.component').then(c => c.FineManagementComponent),
    title: 'Gestión de multas - BiblioSystem'
  },
  {
    path: 'reports',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./components/reports/reports.component').then(c => c.ReportsComponent),
    title: 'Informes - BiblioSystem'
  }
];