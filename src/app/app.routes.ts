import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        canActivate: [authGuard],
        loadChildren: () => import("./dashboard/dashboard.routes").then(m => m.DASHBOARD_ROUTES),
      },
      {
        path: 'auth',
        loadChildren: () => import("./auth/auth.routes").then(m => m.AUTH_ROUTES),
      },
      {
        path: 'catalog',
        canActivate: [authGuard],
        loadChildren: () => import("./catalog/catalog.routes").then(m => m.CATALOG_ROUTES),
      },
      {
        path: 'loans',
        canActivate: [authGuard],
        loadChildren: () => import('./loans/loans.routes').then(m => m.LOANS_ROUTES),
      },
      {
        path: 'reservations',
        canActivate: [authGuard],
        loadChildren: () => import("./reservations/reservations.routes").then(m => m.RESERVATIONS_ROUTES),
      },
      {
        path: 'fines',
        canActivate: [authGuard],
        loadChildren: () => import("./fines/fines.routes").then(m => m.FINES_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import("./admin/admin.routes").then(m => m.ADMIN_ROUTES),
      },
      {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
      }
    ]
  }
];
