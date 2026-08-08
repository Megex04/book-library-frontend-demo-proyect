import { User } from './user.model';
import { Loan } from './loan.model';

export interface Fine {
  id?: number;
  user: User;
  loan: Loan;
  amount: number;
  reason: string;
  status: FineStatus;
  createdAt?: Date;
  updatedAt?: Date;
  paidDate?: Date;
}

export enum FineStatus {
  PENDING = 'PENDING',
  PAID = 'PAID'
}