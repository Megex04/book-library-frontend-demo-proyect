import { Routes } from '@angular/router';

export const RESERVATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import("./components/reservation-list/reservation-list.component").then(c => c.ReservationListComponent),
    title: 'Mis reservas - BiblioSystem'
  },
  {
    path: ':id',
    loadComponent: () => import("./components/reservation-detail/reservation-detail.component").then(c => c.ReservationDetailComponent),
    title: 'Detalle de la reserva - BiblioSystem'
  }
];