import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // Se usa GET /api/users/profile (no /api/admin/users/{id}, que es
  // hasRole('ADMIN') y le daría 403 a un LIBRARIAN o MEMBER viendo su propio
  // perfil). Es el mismo endpoint que ya usa AuthService para poblar
  // currentUser al iniciar sesión.
  profile: any = null;
  isLoading = true;
  isEditing = false;
  isSaving = false;

  form: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudo cargar tu perfil', 'Cerrar', { duration: 3000 });
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    // Descarta cualquier cambio sin guardar, restaurando los valores actuales del perfil.
    this.form.patchValue({
      firstName: this.profile?.firstName,
      lastName: this.profile?.lastName,
      phone: this.profile?.phone
    });
  }

  save(): void {
    if (this.form.invalid || this.isSaving) {
      Object.keys(this.form.controls).forEach(key => this.form.get(key)?.markAsTouched());
      return;
    }

    this.isSaving = true;
    const { firstName, lastName, phone } = this.form.value;

    // PUT /api/users/profile: mismo endpoint hasAnyRole implícito (accesible
    // a cualquier usuario autenticado sobre sus propios datos), simétrico
    // con getCurrentUserProfile().
    this.userService.updateUserProfile({ firstName, lastName, phone }).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.isSaving = false;
        this.isEditing = false;
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });

        // AuthService.currentUser (usado en el header, guards, etc.) no se
        // refresca solo; se recarga aquí para que el nombre mostrado en el
        // header quede sincronizado de inmediato tras editar.
        this.authService.refreshCurrentUser();
      },
      error: (err) => {
        this.isSaving = false;
        const message = err?.error?.message || 'No se pudo actualizar tu perfil';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  getRoleNames(): string {
    const roles: string[] = Array.isArray(this.profile?.roles) ? this.profile.roles : [];
    return roles.map(r => r.replace('ROLE_', '')).join(', ') || 'Sin rol asignado';
  }
}
