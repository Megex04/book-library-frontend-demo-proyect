// Refleja ReservationResponse del backend (dto/reservation/ReservationResponse.java).
// Las fechas LocalDate/LocalDateTime llegan como strings ISO ('2026-10-04', '2026-10-04T10:15:00').
export interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  reservationDate: string;
  expiryDate: string;
  status: ReservationStatus;
  notificationSent: boolean;
  notes?: string;
  librarianId?: number;
  librarianName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Refleja Reservation.ReservationStatus del backend.
export enum ReservationStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}
