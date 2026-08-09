import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private readonly PUBLIC_API_URL = `${environment.apiUrl}/public/authors`;

  constructor(private http: HttpClient) {}

  getAllAuthors(page = 0, size = 100, sort = 'name,asc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.PUBLIC_API_URL, { params });
  }

  searchAuthors(name: string, page = 0, size = 20): Observable<any> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.PUBLIC_API_URL}/search`, { params });
  }
}
