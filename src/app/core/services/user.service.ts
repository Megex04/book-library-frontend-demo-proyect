import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserRoleUpdateRequest {
  roleIds: number[];
}

export interface UserStatusUpdateRequest {
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  private readonly ADMIN_API_URL = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(page = 0, size = 10, sort = 'id,asc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(this.ADMIN_API_URL, { params });
  }

  searchUsers(query: string, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.ADMIN_API_URL}/search`, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.ADMIN_API_URL}/${id}`);
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`);
  }

  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.ADMIN_API_URL}/${id}`, userData);
  }

  updateUserProfile(userData: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, userData);
  }

  // El backend espera { enabled } en el body JSON (UserStatusUpdateRequest,
  // validado con @Valid @RequestBody), no como query param. Antes se mandaba
  // como query param con un body vacío {}, así que Jackson deserializaba
  // enabled como null y @NotNull lo rechazaba con 400 "El estado es
  // obligatorio" antes de que el valor real llegara a usarse.
  updateUserStatus(id: number, enabled: boolean): Observable<User> {
    return this.http.put<User>(`${this.ADMIN_API_URL}/${id}/status`, { enabled });
  }

  updateUserRoles(id: number, roleIds: number[]): Observable<User> {
    return this.http.put<User>(`${this.ADMIN_API_URL}/${id}/roles`, { roleIds });
  }

  changePassword(passwordData: PasswordChangeRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/change-password`, passwordData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ADMIN_API_URL}/${id}`);
  }
}