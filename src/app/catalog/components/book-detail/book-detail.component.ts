import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from '../../../core/services/book.service';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule
  ],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4">
        <button mat-button color="primary" routerLink="/catalog">
          <mat-icon>arrow_back</mat-icon> Volver al catálogo
        </button>
      </div>

      <div *ngIf="isLoading" class="text-center py-8">
        <p class="text-gray-500">Cargando información del libro...</p>
      </div>

      <div *ngIf="!isLoading && book" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Imagen del libro -->
        <div class="md:col-span-1">
          <mat-card>
            <mat-card-content class="p-4 text-center">
              <img [src]="book.coverImageUrl || 'assets/images/book-placeholder.jpg'"
                   alt="{{book.title}}"
                   class="max-w-full max-h-80 mx-auto object-contain"
                   onerror="this.src='assets/images/book-placeholder.jpg'; this.onerror=null;">

              <div class="mt-4">
                <button mat-raised-button color="primary"
                        [disabled]="!book.available || isReserving"
                        (click)="reserveBook()">
                  <mat-icon>bookmark</mat-icon> Reservar
                </button>
              </div>

              <div *ngIf="!book.available" class="mt-4 text-red-600">
                <mat-icon>info</mat-icon> Este libro no está disponible actualmente
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Información del libro -->
        <div class="md:col-span-2">
          <mat-card>
            <mat-card-header>
              <mat-card-title class="text-2xl">{{book.title}}</mat-card-title>
              <mat-card-subtitle class="text-lg">{{ getAuthorNames() }}</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content class="p-4">
              <mat-chip-set>
                <mat-chip *ngFor="let category of book.categories">{{category.name}}</mat-chip>
                <mat-chip [color]="book.available ? 'accent' : 'warn'" selected>
                  {{book.available ? 'Disponible' : 'No disponible'}}
                </mat-chip>
              </mat-chip-set>

              <mat-divider class="my-4"></mat-divider>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>ISBN:</strong> {{book.isbn || 'N/D'}}</p>
                  <p><strong>Editorial:</strong> {{book.publisher || 'N/D'}}</p>
                  <p><strong>Año de publicación:</strong> {{book.publicationYear || 'N/D'}}</p>
                  <p><strong>Idioma:</strong> {{book.language || 'N/D'}}</p>
                </div>
                <div>
                  <p><strong>Edición:</strong> {{book.edition || 'N/D'}}</p>
                  <p><strong>Ejemplares disponibles:</strong> {{book.availableCopies}} de {{book.totalCopies}}</p>
                  <p><strong>Ubicación:</strong> {{book.physicalLocation || 'N/D'}}</p>
                </div>
              </div>

              <mat-divider class="my-4"></mat-divider>

              <mat-tab-group>
                <mat-tab label="Sinopsis">
                  <div class="p-4">
                    <p>{{book.description || 'Sin descripción disponible.'}}</p>
                  </div>
                </mat-tab>
                <mat-tab label="Libros relacionados">
                  <div class="p-4">
                    <div *ngIf="relatedBooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div *ngFor="let relatedBook of relatedBooks" class="border p-2 rounded">
                        <a [routerLink]="['/catalog', relatedBook.id]" class="flex items-center">
                          <img [src]="relatedBook.coverImageUrl || 'assets/images/book-placeholder.jpg'"
                               alt="{{relatedBook.title}}"
                               class="w-12 h-16 object-cover mr-2"
                               onerror="this.src='assets/images/book-placeholder.jpg'; this.onerror=null;">
                          <div>
                            <p class="font-medium">{{relatedBook.title}}</p>
                            <p class="text-sm text-gray-600">{{ getRelatedAuthorNames(relatedBook) }}</p>
                          </div>
                        </a>
                      </div>
                    </div>
                    <div *ngIf="relatedBooks.length === 0" class="text-center py-4">
                      <p class="text-gray-500">No hay libros relacionados disponibles en el catálogo</p>
                    </div>
                  </div>
                </mat-tab>
              </mat-tab-group>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div *ngIf="!isLoading && !book" class="text-center py-8">
        <p class="text-gray-500">No se encontró el libro solicitado</p>
        <button mat-raised-button color="primary" routerLink="/catalog" class="mt-4">
          Volver al catálogo
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class BookDetailComponent implements OnInit {
  book: any = null;
  relatedBooks: any[] = [];
  bookId: number = 0;
  isLoading = true;
  isReserving = false;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookId = +params['id'];
      this.loadBook();
    });
  }

  loadBook(): void {
    this.isLoading = true;
    this.book = null;
    this.relatedBooks = [];

    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;
        this.isLoading = false;
        this.loadRelatedBooks();
      },
      error: () => {
        this.isLoading = false;
        this.book = null;
      }
    });
  }

  loadRelatedBooks(): void {
    const firstCategory = this.book?.categories?.[0]?.name;
    if (!firstCategory) {
      return;
    }

    this.bookService.searchBooks(undefined, undefined, undefined, firstCategory, undefined, undefined, false, 0, 5)
      .subscribe({
        next: (response) => {
          const content: any[] = response?.content ?? [];
          this.relatedBooks = content.filter(b => b.id !== this.book.id).slice(0, 4);
        },
        error: () => {
          this.relatedBooks = [];
        }
      });
  }

  getAuthorNames(): string {
    const authors = this.book?.authors ? Array.from(this.book.authors) as any[] : [];
    return authors.map(a => a.name).join(', ') || 'Autor desconocido';
  }

  getRelatedAuthorNames(relatedBook: any): string {
    const authors = relatedBook?.authors ? Array.from(relatedBook.authors) as any[] : [];
    return authors.map((a: any) => a.name).join(', ') || 'Autor desconocido';
  }

  reserveBook(): void {
    if (!this.book || this.isReserving) {
      return;
    }

    this.isReserving = true;
    this.reservationService.createReservation({ bookId: this.bookId }).subscribe({
      next: () => {
        this.isReserving = false;
        this.snackBar.open('Libro reservado correctamente', 'Cerrar', { duration: 3000 });
        this.loadBook();
      },
      error: (err) => {
        this.isReserving = false;
        const message = err?.error?.message || 'No se pudo reservar el libro';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
