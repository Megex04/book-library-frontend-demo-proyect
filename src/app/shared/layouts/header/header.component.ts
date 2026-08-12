import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Antes había una sola bandera (isMenuOpen) controlando tanto el dropdown
  // de usuario (desktop) como el menú hamburguesa (móvil): al abrir el
  // hamburguesa en responsive, el dropdown de usuario se abría también,
  // superpuesto. Se separan en dos estados independientes.
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isDarkMode = false;
  isLoggedIn = false;
  userRole = '';
  userDisplayName = '';
  userInitial = 'U';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkDarkModePreference();

    // Estado inicial a partir del token guardado
    this.updateAuthState();

    // Reaccionar a cambios de sesión (login/logout) mientras la app está abierta
    this.authService.currentUser$.subscribe(() => {
      this.updateAuthState();
    });
  }

  private updateAuthState(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    this.userRole = user?.roles?.[0]?.name?.replace('ROLE_', '') || '';

    const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
    this.userDisplayName = fullName || 'Usuario';
    this.userInitial = (user?.firstName?.[0] || fullName[0] || 'U').toUpperCase();
  }

  // Usa authService.hasRole() (revisa TODOS los roles del usuario) en vez de
  // comparar contra userRole (que solo mira roles[0]). Un usuario puede tener
  // varios roles y ADMIN/LIBRARIAN no necesariamente queda primero en el array
  // que devuelve el backend, así que basarse solo en userRole podía ocultar el
  // link de Administración a un LIBRARIAN legítimo.
  get isStaff(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('LIBRARIAN');
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isUserMenuOpen = false;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }

  checkDarkModePreference(): void {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login'])
    });
  }
}
