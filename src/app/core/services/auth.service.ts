import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, filter, take, of } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  // Indica si ya se resolvió (con éxito o con error) el intento de cargar el
  // perfil del usuario a partir del token guardado. Arranca en `true` cuando
  // no hay token válido (no hay nada que esperar), y en `false` cuando sí lo
  // hay, hasta que fetchAndSetCurrentUser() complete.
  //
  // Por qué existe: roleGuard (y cualquier código que llame a hasRole())
  // dependía de currentUserSubject, que se llena de forma asíncrona
  // (setTimeout(0) + petición HTTP a /users/profile). Si el usuario navegaba
  // directo a una ruta protegida por rol (recargar la página, pegar una URL,
  // o incluso navegar muy rápido tras el login) antes de que esa petición
  // completara, hasRole() devolvía false para todos los roles y el guard
  // rechazaba el acceso a un usuario que sí tenía el rol correcto -> por eso
  // un LIBRARIAN válido era expulsado de /admin/loans, /admin/reservations,
  // etc., y el dashboard mostraba N/D (isAdmin se evaluaba como false antes
  // de tiempo).
  private profileResolvedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  /**
   * Emite `true` una sola vez, cuando el intento de cargar el perfil del
   * usuario ya terminó (haya tenido éxito o no). Cualquier código que
   * necesite conocer el rol real del usuario antes de decidir algo (guards,
   * componentes que llaman a hasRole()) debe esperar a este observable en
   * vez de leer currentUser directamente, para no pisar una carrera con la
   * petición a /users/profile todavía en curso.
   */
  whenProfileResolved(): Observable<boolean> {
    if (this.profileResolvedSubject.value) {
      return of(true);
    }
    return this.profileResolvedSubject.pipe(
      filter(resolved => resolved),
      take(1)
    );
  }

  // El JWT que emite el backend (JwtTokenProvider.createToken) solo incluye
  // los claims 'sub' (username) y 'auth' (string de authorities separadas por
  // coma, ej. "ROLE_ADMIN,ROLE_MEMBER"). NO incluye un objeto 'user' con
  // roles/nombre/etc. Antes se leía decodedToken.user, que siempre era
  // undefined, así que currentUser nunca tenía rol -> el link de
  // Administración en el header nunca se mostraba, sin importar el usuario.
  // Ahora se pide el perfil real a /api/users/profile y se normaliza al shape
  // que usa el frontend (roles: {id,name}[]).
  //
  // IMPORTANTE: no se puede llamar a fetchAndSetCurrentUser() (que usa
  // HttpClient) directamente aquí en el constructor. ErrorInterceptor
  // inyecta AuthService, y si AuthService dispara una petición HTTP durante
  // su propia construcción, Angular necesita terminar de construir AuthService
  // para poder construir la cadena de interceptores (incluido ErrorInterceptor)
  // que esa misma petición necesita -> ciclo -> NG0200 "Circular dependency
  // detected for InjectionToken HTTP_INTERCEPTORS". Diferir con setTimeout(0)
  // rompe el ciclo: la llamada ocurre en el siguiente tick, cuando la
  // inyección de dependencias ya terminó por completo.
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      setTimeout(() => this.fetchAndSetCurrentUser(), 0);
    } else {
      // No hay token válido: no hay perfil que esperar, así que se marca
      // como "resuelto" de inmediato para no dejar a whenProfileResolved()
      // esperando algo que nunca va a llegar.
      this.profileResolvedSubject.next(true);
    }
  }

  private fetchAndSetCurrentUser(): void {
    this.http.get<any>(`${environment.apiUrl}/users/profile`).subscribe({
      next: (profile) => {
        this.currentUserSubject.next(this.normalizeUser(profile));
        this.profileResolvedSubject.next(true);
      },
      error: () => {
        this.currentUserSubject.next(null);
        this.profileResolvedSubject.next(true);
      }
    });
  }

  // El backend (UserDTO) devuelve roles como Set<String> (ej. ["ROLE_ADMIN"]),
  // pero el modelo User del frontend espera roles: {id, name}[].
  private normalizeUser(profile: any): User {
    const roles = Array.isArray(profile?.roles)
      ? profile.roles.map((roleName: string, index: number) => ({ id: index, name: roleName }))
      : [];

    return { ...profile, roles };
  }

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          // Se resetea a "no resuelto" antes de disparar la carga del perfil
          // del nuevo usuario, por si whenProfileResolved() ya había quedado
          // en true de una sesión anterior (o de arrancar sin sesión) en la
          // misma pestaña.
          this.profileResolvedSubject.next(false);
          this.fetchAndSetCurrentUser();
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/register`, userData);
  }

  verifyAccount(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.API_URL}/verify?token=${token}`);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password?email=${email}`, {});
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password?token=${token}&newPassword=${newPassword}`, {});
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<TokenResponse>(`${this.API_URL}/refresh-token?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          this.fetchAndSetCurrentUser();
        })
      );
  }

  logout(): Observable<{ message: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ message: string }>(`${this.API_URL}/logout?refreshToken=${refreshToken}`, {})
      .pipe(
        tap(() => this.clearLocalSession()),
        // Si el backend falla al cerrar sesión (token ya corrupto, servidor
        // caído, etc.) igual queremos limpiar la sesión local: si esta
        // llamada nunca se completa correctamente, el usuario se queda
        // "atascado" logueado con un token muerto.
        catchError((err) => {
          this.clearLocalSession();
          return throwError(() => err);
        })
      );
  }

  // Limpieza local síncrona, sin depender de ninguna respuesta del backend.
  // Usado tanto por logout() como por el ErrorInterceptor cuando cualquier
  // petición recibe un 401 (sesión inválida/expirada).
  clearLocalSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Acepta tanto 'ADMIN' como 'ROLE_ADMIN' para no depender de que cada
  // llamador conozca si el backend antepone el prefijo ROLE_ o no.
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const normalizedTarget = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user?.roles.some(r => r.name === role || r.name === normalizedTarget) || false;
  }
}