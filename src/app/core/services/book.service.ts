import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';
import { environment } from '../../../environments/environment';

export interface BookCreateRequest {
  title: string;
  isbn: string;
  year: number;
  edition: string;
  publisher: string;
  language: string;
  pages: number;
  description: string;
  coverImage?: string;
  location: string;
  stock: number;
  authorIds: number[];
  categoryIds: number[];
}

export interface BookUpdateRequest {
  title?: string;
  isbn?: string;
  year?: number;
  edition?: string;
  publisher?: string;
  language?: string;
  pages?: number;
  description?: string;
  coverImage?: string;
  location?: string;
  stock?: number;
  authorIds?: number[];
  categoryIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = `${environment.apiUrl}/admin/books`;
  private readonly PUBLIC_API_URL = `${environment.apiUrl}/public/books`;

  constructor(private http: HttpClient) {}

  getAllBooks(page = 0, size = 10, sort = 'title,asc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.PUBLIC_API_URL, { params });
  }

  searchBooks(title?: string, isbn?: string, author?: string, category?: string, 
              year?: number, language?: string, onlyAvailable = false, 
              page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('onlyAvailable', onlyAvailable.toString());

    if (title) params = params.set('title', title);
    if (isbn) params = params.set('isbn', isbn);
    if (author) params = params.set('author', author);
    if (category) params = params.set('category', category);
    if (year) params = params.set('year', year.toString());
    if (language) params = params.set('language', language);

    return this.http.get<any>(`${this.PUBLIC_API_URL}/search`, { params });
  }

  // El backend devuelve BookDTO (authors[], categories[], publicationYear,
  // coverImageUrl, available, etc.), forma que no coincide con el modelo
  // Book de frontend (author/category planos), así que se tipa como any.
  getBookById(id: number): Observable<any> {
    return this.http.get<any>(`${this.PUBLIC_API_URL}/${id}`);
  }

  createBook(bookData: BookCreateRequest): Observable<Book> {
    return this.http.post<Book>(this.API_URL, bookData);
  }

  updateBook(id: number, bookData: BookUpdateRequest): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/${id}`, bookData);
  }

  updateBookInventory(id: number, totalCopies: number, availableCopies: number): Observable<Book> {
    const params = new HttpParams()
      .set('totalCopies', totalCopies.toString())
      .set('availableCopies', availableCopies.toString());
    return this.http.put<Book>(`${this.API_URL}/${id}/inventory`, {}, { params });
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getRecentBooks(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.PUBLIC_API_URL}/recent`, { params });
  }

  uploadBookCover(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.API_URL}/${id}/cover`, formData);
  }

  importBooks(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.API_URL}/import`, formData);
  }
}