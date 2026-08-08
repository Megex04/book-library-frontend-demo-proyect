import { Routes } from '@angular/router';
import { guestGuard } from '../core/guards/guest.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent),
    title: 'Iniciar sesión - BiblioSystem'
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/register/register.component').then(c => c.RegisterComponent),
    title: 'Registrarse - BiblioSystem'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent),
    title: 'Recuperar contraseña - BiblioSystem'
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(c => c.ResetPasswordComponent),
    title: 'Restablecer contraseña - BiblioSystem'
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./components/verify-email/verify-email.component').then(c => c.VerifyEmailComponent),
    title: 'Verificar correo electrónico - BiblioSystem'
  }
];