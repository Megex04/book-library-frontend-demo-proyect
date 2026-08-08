import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly PUBLIC_API_URL = `${environment.apiUrl}/public/categories`;

  constructor(private http: HttpClient) {}

  getAllCategories(page = 0, size = 50, sort = 'name,asc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.PUBLIC_API_URL, { params });
  }

  getMainCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.PUBLIC_API_URL}/main`);
  }

  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.PUBLIC_API_URL}/${id}`);
  }

  getSubcategories(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.PUBLIC_API_URL}/${id}/subcategories`);
  }
}
