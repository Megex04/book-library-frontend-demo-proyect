import { User } from './user.model';
import { Book } from './book.model';

export interface Loan {
  id?: number;
  user: User;
  book: Book;
  loanDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: LoanStatus;
  renewalCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}