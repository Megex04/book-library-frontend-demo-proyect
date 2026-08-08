import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan.model';
import { environment } from '../../../environments/environment';

export interface LoanCreateRequest {
  userId: number;
  bookId: number;
}

export interface LoanUpdateRequest {
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private readonly API_URL = `${environment.apiUrl}/loans`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/loans`;

  constructor(private http: HttpClient) {}

  getAllLoans(status?: string, page = 0, size = 10, sort = 'loanDate,desc'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (status) params = params.set('status', status);

    return this.http.get<any>(this.ADMIN_API_URL, { params });
  }

  getLoansByUser(userId: number, status?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.ADMIN_API_URL}/user/${userId}`, { params });
  }

  getMyLoans(status?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.API_URL}/my`, { params });
  }

  getLoanById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  createLoan(loanData: LoanCreateRequest): Observable<any> {
    return this.http.post<any>(this.ADMIN_API_URL, loanData);
  }

  returnBook(id: number, request?: LoanUpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.ADMIN_API_URL}/${id}/return`, request || {});
  }

  renewLoan(id: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${id}/renew`, {});
  }

  getLoansByBook(bookId: number, status?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) params = params.set('status', status);

    return this.http.get<any>(`${this.ADMIN_API_URL}/book/${bookId}`, { params });
  }

  getOverdueLoans(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'dueDate');

    return this.http.get<any>(`${this.ADMIN_API_URL}/overdue`, { params });
  }

  getLoansExpiringSoon(days = 7, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('days', days.toString())
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'dueDate');

    return this.http.get<any>(`${this.ADMIN_API_URL}/expiring-soon`, { params });
  }

  getLoanStats(startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any[]>(`${this.ADMIN_API_URL}/stats`, { params });
  }
}