import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { BookService } from '../../../core/services/book.service';
import { LoanService } from '../../../core/services/loan.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { FineService } from '../../../core/services/fine.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
  /*styleUrls: ['./admin-dashboard.component.css']*/
})
export class AdminDashboardComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private bookService: BookService,
    private loanService: LoanService,
    private reservationService: ReservationService,
    private fineService: FineService
  ) {}

  // Gestión de usuarios e informes son solo-ADMIN en el backend
  // (UserController: hasRole('ADMIN'); reportes agregan stats de multas que
  // también son ADMIN-only en FineController). Se ocultan los accesos
  // rápidos correspondientes para no llevar a un LIBRARIAN a una ruta que el
  // roleGuard igualmente le va a bloquear.
  get isAdmin(): boolean {
    return this.authService.hasRole('ADMIN');
  }

  isLoadingStats = true;
  isLoadingActivity = true;
  // Nombres de las tarjetas que fallaron por un error real (no 403 de
  // permisos, que es esperado para algunos roles). Si esta lista tiene
  // elementos, el N/D de esa tarjeta no es "sin permiso", es un fallo que
  // vale la pena investigar (backend caído, endpoint roto, etc.).
  statsLoadErrors: string[] = [];

  // Estadísticas del sistema, cargadas desde el backend real. Arrancan en
  // null (en vez de un número hardcodeado) para poder mostrar un estado de
  // carga en la plantilla y distinguirlo de "0 de verdad".
  stats: {
    totalUsers: number | null;
    totalBooks: number | null;
    activeLoans: number | null;
    pendingReservations: number | null;
    overdueLoans: number | null;
    unpaidFines: number | null;
  } = {
    totalUsers: null,
    totalBooks: null,
    activeLoans: null,
    pendingReservations: null,
    overdueLoans: null,
    unpaidFines: null
  };

  // El backend no expone ningún endpoint de "actividad reciente" / auditoría.
  // En vez de simular esa sección con datos inventados, se muestra un listado
  // real: los préstamos más recientes (GET /api/admin/loans, sort loanDate,desc).
  recentActivity: Array<{
    type: 'loan';
    action: string;
    name: string;
    time: string;
  }> = [];

  ngOnInit(): void {
    // Se espera a que el perfil del usuario (y por tanto sus roles reales)
    // esté resuelto antes de decidir qué llamadas hacer. Antes, isAdmin se
    // evaluaba de inmediato en ngOnInit; si el perfil todavía no había
    // llegado (carga asíncrona tras login/recarga), isAdmin daba false
    // aunque el usuario sí fuera ADMIN, y algunas decisiones tomadas aquí
    // quedaban basadas en un estado de rol todavía no confirmado.
    this.authService.whenProfileResolved().subscribe(() => {
      this.loadStats();
      this.loadRecentActivity();
    });
  }

  private loadStats(): void {
    this.isLoadingStats = true;

    // Cada llamada se protege con catchError porque un LIBRARIAN no tiene
    // permiso sobre /admin/users (hasRole('ADMIN') en el backend) y recibiría
    // un 403 ahí; el resto de tarjetas debe seguir cargando igual. Se
    // distingue "sin permiso / sin datos" (null) de un error real con
    // statsLoadErrors, para no mostrar N/D en silencio ante un fallo que sí
    // debería ser visible (ej. backend caído).
    this.statsLoadErrors = [];

    const trackError = (label: string) => catchError((err): Observable<any> => {
      if (err?.status && err.status !== 403) {
        this.statsLoadErrors.push(label);
      }
      return of(null);
    });

    forkJoin({
      users: this.isAdmin
        ? this.userService.getUsers(0, 1).pipe(trackError('usuarios'))
        : of(null),
      books: this.bookService.getAllBooks(0, 1).pipe(trackError('libros')),
      activeLoans: this.loanService.getAllLoans('ACTIVE', 0, 1).pipe(trackError('préstamos activos')),
      overdueLoans: this.loanService.getOverdueLoans(0, 1).pipe(trackError('préstamos vencidos')),
      pendingReservations: this.reservationService.getAllReservations('PENDING').pipe(trackError('reservas pendientes')),
      pendingFines: this.fineService.getAllFines(0, 1).pipe(trackError('multas pendientes'))
    }).subscribe(({ users, books, activeLoans, overdueLoans, pendingReservations, pendingFines }) => {
      this.stats = {
        totalUsers: users?.totalElements ?? null,
        totalBooks: books?.totalElements ?? null,
        activeLoans: activeLoans?.totalElements ?? null,
        overdueLoans: overdueLoans?.totalElements ?? null,
        // getAllReservations devuelve un array plano, no una Page.
        pendingReservations: Array.isArray(pendingReservations) ? pendingReservations.length : null,
        unpaidFines: pendingFines?.totalElements ?? null
      };
      this.isLoadingStats = false;
    });
  }

  private loadRecentActivity(): void {
    this.isLoadingActivity = true;
    this.loanService.getAllLoans(undefined, 0, 5, 'loanDate,desc').pipe(
      catchError(() => of(null))
    ).subscribe(response => {
      const loans = response?.content ?? [];
      this.recentActivity = loans.map((loan: any) => ({
        type: 'loan' as const,
        action: loan.status === 'RETURNED' ? 'Préstamo devuelto' : 'Préstamo realizado',
        name: `${loan.userName ?? 'Usuario'} - ${loan.bookTitle ?? 'Libro'}`,
        time: this.formatRelativeDate(loan.loanDate)
      }));
      this.isLoadingActivity = false;
    });
  }

  private formatRelativeDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) return `${Math.max(diffMinutes, 0)} minutos`;
    if (diffHours < 24) return `${diffHours} horas`;
    return `${diffDays} días`;
  }
}
