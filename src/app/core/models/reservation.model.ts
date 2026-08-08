import { User } from './user.model';
import { Book } from './book.model';

export interface Reservation {
  id?: number;
  user: User;
  book: Book;
  reservationDate: Date;
  expirationDate: Date;
  status: ReservationStatus;
  notificationSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}