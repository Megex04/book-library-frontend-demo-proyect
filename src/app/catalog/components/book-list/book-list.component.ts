import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { BookService } from '../../../core/services/book.service';
import { CategoryService } from '../../../core/services/category.service';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Catálogo de Libros</h1>

      <!-- Filtros y búsqueda -->
      <mat-card class="mb-6">
        <mat-card-content>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Título" [(ngModel)]="searchQuery" (ngModelChange)="onFilterChange()">
              <button *ngIf="searchQuery" matSuffix mat-icon-button aria-label="Clear" (click)="searchQuery=''; onFilterChange()">
                <mat-icon>close</mat-icon>
              </button>
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Categoría</mat-label>
              <mat-select [(ngModel)]="selectedCategory" (selectionChange)="onFilterChange()">
                <mat-option value="">Todas</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.name">
                  {{category.name}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Ordenar por</mat-label>
              <mat-select [(ngModel)]="sortBy" (selectionChange)="onFilterChange()">
                <mat-option value="title,asc">Título</mat-option>
                <mat-option value="publicationYear,desc">Fecha de publicación</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="flex items-center justify-between">
            <mat-checkbox [(ngModel)]="onlyAvailable" (change)="onFilterChange()" [ngModelOptions]="{standalone: true}">
              Solo disponibles
            </mat-checkbox>
            <button mat-raised-button color="primary" (click)="loadBooks()">
              <mat-icon>filter_list</mat-icon> Aplicar filtros
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Estado de carga -->
      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando catálogo...</p>
      </div>

      <!-- Resultados -->
      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <mat-card *ngFor="let book of books" class="h-full flex flex-col">
          <mat-card-header>
            <mat-card-title class="text-lg">{{book.title}}</mat-card-title>
            <mat-card-subtitle>{{ getAuthorNames(book) }}</mat-card-subtitle>
          </mat-card-header>

          <div class="flex-grow-0 p-4 text-center">
            <img [src]="book.coverImageUrl || 'assets/images/book-placeholder.jpg'"
                 alt="{{book.title}}"
                 class="max-h-48 mx-auto object-contain"
                 onerror="this.src='assets/images/book-placeholder.jpg'; this.onerror=null;">
          </div>

          <mat-card-content class="flex-grow p-4">
            <p class="mb-2"><strong>ISBN:</strong> {{book.isbn || 'N/D'}}</p>
            <p class="mb-2"><strong>Categoría:</strong> {{ getCategoryNames(book) }}</p>
            <p class="mb-2"><strong>Publicación:</strong> {{book.publicationYear || 'N/D'}}</p>
            <p class="mb-2"><strong>Disponibilidad:</strong>
              <span [ngClass]="{
                'text-green-600': book.available,
                'text-red-600': !book.available
              }">
                {{book.available ? 'Disponible' : 'No disponible'}}
              </span>
            </p>
            <p class="line-clamp-3 text-gray-600 mt-2">{{book.description}}</p>
          </mat-card-content>

          <mat-card-actions class="p-4">
            <button mat-raised-button color="primary" [routerLink]="['/catalog', book.id]">
              Ver detalles
            </button>
            <!-- Reservar no requiere que haya copias disponibles: el backend
                 (ReservationService.createReservation) acepta reservas sin
                 stock y las deja en estado PENDING hasta que se libere una
                 copia; solo si ya hay disponibilidad, procesa la reserva de
                 inmediato (READY). Deshabilitar el botón cuando
                 !book.available bloqueaba justamente el caso de uso real de
                 "reservar en cola". Solo se bloquea mientras la petición
                 está en curso, para evitar doble clic. -->
            <button mat-button color="accent"
                    [disabled]="reservingBookIds.has(book.id)"
                    (click)="reserveBook(book.id)">
              {{ book.available ? 'Reservar' : 'Reservar (en cola)' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Mensaje si no hay resultados -->
      <div *ngIf="!isLoading && books.length === 0" class="text-center py-8">
        <p class="text-gray-500">No se encontraron libros que coincidan con los criterios de búsqueda</p>
        <button mat-raised-button color="primary" (click)="resetFilters()" class="mt-4">
          Limpiar filtros
        </button>
      </div>

      <!-- Paginación -->
      <mat-paginator
        [length]="totalBooks"
        [pageSize]="pageSize"
        [pageIndex]="currentPage"
        [pageSizeOptions]="[6, 12, 24, 48]"
        (page)="onPageChange($event)"
        *ngIf="!isLoading && books.length > 0"
        class="mt-6">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .mat-mdc-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .mat-mdc-card-content {
      flex-grow: 1;
    }
  `]
})
export class BookListComponent implements OnInit {
  books: any[] = [];
  categories: any[] = [];
  isLoading = true;
  // IDs de libros con una reserva en curso, para deshabilitar solo ese botón
  // (evitar doble clic) sin bloquear el resto de la lista.
  reservingBookIds = new Set<number>();

  // Filtros
  searchQuery: string = '';
  selectedCategory: string = '';
  sortBy: string = 'title,asc';
  onlyAvailable: boolean = false;

  // Paginación (controlada por el servidor)
  pageSize: number = 6;
  currentPage: number = 0;
  totalBooks: number = 0;

  private filterChange$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {
    this.filterChange$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage = 0;
      this.loadBooks();
    });
  }

  ngOnInit(): void {
    this.loadBooks();
    this.loadCategories();
  }

  onFilterChange(): void {
    this.filterChange$.next();
  }

  loadBooks(): void {
    this.isLoading = true;
    const [sortField, sortDir] = this.sortBy.split(',');

    this.bookService.searchBooks(
      this.searchQuery || undefined,
      undefined,
      undefined,
      this.selectedCategory || undefined,
      undefined,
      undefined,
      this.onlyAvailable,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        let content: any[] = response?.content ?? [];

        // El backend de búsqueda no acepta parámetro de orden dinámico,
        // así que aplicamos el orden elegido sobre la página ya recibida.
        content = [...content].sort((a, b) => {
          if (sortField === 'publicationYear') {
            return (b.publicationYear ?? 0) - (a.publicationYear ?? 0);
          }
          return (a.title || '').localeCompare(b.title || '');
        });

        this.books = content;
        this.totalBooks = response?.totalElements ?? content.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudo cargar el catálogo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response) => {
        this.categories = response?.content ?? [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  getAuthorNames(book: any): string {
    const authors = book.authors ? Array.from(book.authors) as any[] : [];
    return authors.map(a => a.name).join(', ') || 'Autor desconocido';
  }

  getCategoryNames(book: any): string {
    const cats = book.categories ? Array.from(book.categories) as any[] : [];
    return cats.map(c => c.name).join(', ') || 'Sin categoría';
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.sortBy = 'title,asc';
    this.onlyAvailable = false;
    this.currentPage = 0;
    this.loadBooks();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  reserveBook(bookId: number): void {
    if (this.reservingBookIds.has(bookId)) {
      return;
    }

    this.reservingBookIds.add(bookId);
    this.reservationService.createReservation({ bookId }).subscribe({
      next: (reservation) => {
        this.reservingBookIds.delete(bookId);
        const message = reservation?.status === 'PENDING'
          ? 'Reserva registrada: quedaste en la lista de espera hasta que haya una copia disponible'
          : 'Libro reservado correctamente, ya está listo para retirar';
        this.snackBar.open(message, 'Cerrar', { duration: 4000 });
        this.loadBooks();
      },
      error: (err) => {
        this.reservingBookIds.delete(bookId);
        const message = err?.error?.message || 'No se pudo reservar el libro';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
