import { Routes } from '@angular/router';

export const FINES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import("./components/fine-list/fine-list.component").then(c => c.FineListComponent),
    title: 'Mis multas - BiblioSystem'
  },
  {
    path: ':id',
    loadComponent: () => import("./components/fine-detail/fine-detail.component").then(c => c.FineDetailComponent),
    title: 'Detalle de la multa - BiblioSystem'
  },
  {
    path: ':id/pay',
    loadComponent: () => import("./components/fine-payment/fine-payment.component").then(c => c.FinePaymentComponent),
    title: 'Pagar multa - BiblioSystem'
  }
];