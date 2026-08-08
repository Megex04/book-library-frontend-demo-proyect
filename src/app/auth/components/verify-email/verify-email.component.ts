import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  isVerified = false;
  hasError = false;
  errorMessage = '';
  token: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Obtener el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.authService.verifyAccount(this.token).subscribe({
        next: () => {
          this.isVerifying = false;
          this.isVerified = true;
        },
        error: (err) => {
          this.isVerifying = false;
          this.hasError = true;
          this.errorMessage = err?.error?.message || 'No pudimos verificar tu correo electrónico. El enlace puede haber expirado o ser inválido.';
        }
      });
    } else {
      // Si no hay token, mostrar mensaje de instrucciones
      this.isVerifying = false;
    }
  }

  resendVerificationEmail() {
    // Implementar lógica para reenviar correo de verificación
    console.log('Reenviando correo de verificación');
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}