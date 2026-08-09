import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Protege rutas que requieren uno o más roles específicos.
 * Los roles permitidos se definen en la propiedad `data.roles` de la ruta, por ejemplo:
 *   { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } }
 *
 * Requiere que authGuard se ejecute antes (o en conjunto) para garantizar que hay sesión.
 *
 * Espera a whenProfileResolved() antes de evaluar hasRole(): el perfil del
 * usuario (y por tanto sus roles reales) se carga de forma asíncrona después
 * del arranque de la app o del login (ver AuthService.fetchAndSetCurrentUser).
 * Si este guard leyera hasRole() de inmediato, en una navegación directa
 * (recargar la página, pegar una URL, F5) podía encontrar el perfil todavía
 * sin cargar y rechazar a un usuario que sí tenía el rol correcto -> por eso
 * un LIBRARIAN válido era expulsado de rutas a las que sí tenía acceso.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  return authService.whenProfileResolved().pipe(
    map(() => {
      const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
      return hasRequiredRole ? true : router.createUrlTree(['/']);
    })
  );
};
