import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
    title: 'Panel de administración - BiblioSystem'
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(c => c.UserManagementComponent),
    title: 'Gestión de usuarios - BiblioSystem'
  },
  {
    path: 'books',
    loadComponent: () => import('./components/book-management/book-management.component').then(c => c.BookManagementComponent),
    title: 'Gestión de libros - BiblioSystem'
  },
  {
    path: 'loans',
    loadComponent: () => import('./components/loan-management/loan-management.component').then(c => c.LoanManagementComponent),
    title: 'Gestión de préstamos - BiblioSystem'
  },
  {
    path: 'reservations',
    loadComponent: () => import('./components/reservation-management/reservation-management.component').then(c => c.ReservationManagementComponent),
    title: 'Gestión de reservas - BiblioSystem'
  },
  {
    path: 'fines',
    loadComponent: () => import('./components/fine-management/fine-management.component').then(c => c.FineManagementComponent),
    title: 'Gestión de multas - BiblioSystem'
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(c => c.ReportsComponent),
    title: 'Informes - BiblioSystem'
  }
];