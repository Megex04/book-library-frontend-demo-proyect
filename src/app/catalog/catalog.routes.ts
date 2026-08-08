import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/book-list/book-list.component').then(c => c.BookListComponent),
    title: 'Catálogo de libros - BiblioSystem'
  },
  {
    path: ':id',
    loadComponent: () => import('./components/book-detail/book-detail.component').then(c => c.BookDetailComponent),
    title: 'Detalle del libro - BiblioSystem'
  }
];