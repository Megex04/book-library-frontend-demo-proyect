import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/reservation.model';

export interface ReservationCreateRequest {
  // El backend toma el usuario del token (@AuthenticationPrincipal), no del body.
  bookId: number;
}

export interface ReservationUpdateRequest {
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = `${environment.apiUrl}/reservations`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/reservations`;

  constructor(private http: HttpClient) {}

  // El backend expone GET /api/reservations/my y devuelve un array simple
  // de ReservationResponse (bookTitle, userName, etc. planos), no un objeto
  // paginado como préstamos/multas.
  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/my`);
  }

  createReservation(reservationData: ReservationCreateRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.API_URL, reservationData);
  }

  // El backend expone PUT /api/reservations/{id}/cancel (no DELETE), body opcional { reason }
  cancelReservation(id: number, reason?: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.API_URL}/${id}/cancel`, { reason });
  }

  // --- Endpoints de administración (LIBRARIAN/ADMIN) ---

  // GET /api/admin/reservations devuelve una List<ReservationResponse> plana,
  // no una Page. Solo acepta status opcional como query param.
  getAllReservations(status?: string): Observable<Reservation[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<Reservation[]>(this.ADMIN_API_URL, { params });
  }

  // GET /api/admin/books/{bookId}/reservations
  getReservationsByBook(bookId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrl}/admin/books/${bookId}/reservations`);
  }

  // PUT /api/admin/reservations/{id}/process (marcar como lista para retirar)
  processReservation(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.ADMIN_API_URL}/${id}/process`, {});
  }

  // PUT /api/admin/reservations/{id}/complete (entregar el libro; genera el préstamo real)
  completeReservation(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.ADMIN_API_URL}/${id}/complete`, {});
  }

  // PUT /api/admin/reservations/{id}/cancel, body { reason } requerido por el backend
  cancelReservationByAdmin(id: number, reason: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.ADMIN_API_URL}/${id}/cancel`, { reason });
  }
}
