import { Routes } from '@angular/router';

export const LOANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/loan-list/loan-list.component').then(c => c.LoanListComponent),
    title: 'Mis préstamos - BiblioSystem'
  },
  {
    path: ':id',
    loadComponent: () => import('./components/loan-detail/loan-detail.component').then(c => c.LoanDetailComponent),
    title: 'Detalle del préstamo - BiblioSystem'
  }
];