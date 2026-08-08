import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || 'Solicitud incorrecta';
              break;
            case 401:
              errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente';
              // authService.logout() devuelve un Observable "frío": si no se
              // suscribe, RxJS nunca ejecuta su lógica (no llama al backend,
              // no limpia localStorage, no resetea currentUserSubject). Antes
              // se llamaba sin `.subscribe()`, así que el token inválido se
              // quedaba en localStorage y cada petición volvía a fallar con
              // 401 en un ciclo silencioso. Aquí forzamos la limpieza local
              // de inmediato (no dependemos de que el backend responda) y
              // solo navegamos una vez.
              this.clearSessionAndRedirect();
              break;
            case 403:
              errorMessage = 'No tiene permisos para realizar esta acción';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado';
              break;
            case 409:
              errorMessage = error.error?.message || 'Conflicto en la solicitud';
              break;
            case 422:
              errorMessage = error.error?.message || 'Datos de entrada inválidos';
              break;
            case 500:
              errorMessage = 'Error interno del servidor';
              break;
            case 503:
              errorMessage = 'Servicio no disponible temporalmente';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
          }
        }

        // Mostrar mensaje de error al usuario (excepto para errores 401 que redirigen)
        if (error.status !== 401) {
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }

        return throwError(() => error);
      })
    );
  }

  private clearSessionAndRedirect(): void {
    // Limpieza local inmediata y síncrona: no dependemos de que el backend
    // responda (podría estar caído, o el propio 401 puede venir de un token
    // ya corrupto que /auth/logout también rechazaría).
    this.authService.clearLocalSession();

    if (!this.router.url.startsWith('/auth/login')) {
      this.router.navigate(['/auth/login']);
    }
  }
}