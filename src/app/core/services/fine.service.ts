import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fine } from '../models/fine.model';
import { environment } from '../../../environments/environment';

export interface FineUpdateRequest {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class FineService {
  private readonly API_URL = `${environment.apiUrl}/fines`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/fines`;

  constructor(private http: HttpClient) {}

  getAllFines(page = 0, size = 10, sort = 'createdAt,desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.ADMIN_API_URL, { params });
  }

  getFinesByUser(userId: number, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.ADMIN_API_URL}/user/${userId}`, { params });
  }

  getMyFines(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.API_URL}/my`, { params });
  }

  getFineById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  payFine(id: number): Observable<Fine> {
    return this.http.post<Fine>(`${this.ADMIN_API_URL}/${id}/pay`, {});
  }

  waiveFine(id: number): Observable<Fine> {
    return this.http.post<Fine>(`${this.ADMIN_API_URL}/${id}/waive`, {});
  }

  getFineStats(): Observable<any> {
    return this.http.get<any>(`${this.ADMIN_API_URL}/stats`);
  }

  getTotalPendingFines(): Observable<any> {
    return this.http.get<any>(`${this.ADMIN_API_URL}/total-pending`);
  }

  getTotalPaidFines(): Observable<any> {
    return this.http.get<any>(`${this.ADMIN_API_URL}/total-paid`);
  }
}