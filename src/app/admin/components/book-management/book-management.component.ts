import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookService } from '../../../core/services/book.service';
import { BookEditDialogComponent } from './book-edit-dialog/book-edit-dialog.component';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './book-management.component.html',
  styleUrls: ['./book-management.component.scss']
})
export class BookManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  displayedColumns: string[] = ['id', 'title', 'author', 'category', 'status', 'copies', 'actions'];
  dataSource: any[] = [];
  searchTerm: string = '';
  isLoading = true;
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private bookService: BookService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading = true;
    this.bookService.getAllBooks(this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = (response?.content ?? []).map((b: any) => this.normalizeBook(b));
        this.totalElements = response?.totalElements ?? this.dataSource.length;
        this.isLoading = false;
      },
      error: () => {
        this.dataSource = [];
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar los libros', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // BookDTO trae authors/categories como Set<{id,name}> y availableCopies/
  // totalCopies en vez de los nombres planos que usa la plantilla; se
  // aplanan aquí conservando el objeto original para las acciones.
  private normalizeBook(book: any): any {
    const authorNames = Array.isArray(book.authors) ? book.authors.map((a: any) => a.name).join(', ') : '';
    const categoryNames = Array.isArray(book.categories) ? book.categories.map((c: any) => c.name).join(', ') : '';
    return {
      ...book,
      author: authorNames || 'Sin autor asignado',
      category: categoryNames || 'Sin categoría',
      copies: book.totalCopies,
      availableCopies: book.availableCopies,
      status: book.availableCopies > 0 ? 'Disponible' : 'Agotado'
    };
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  get filteredData(): any[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      return this.dataSource;
    }
    return this.dataSource.filter(book =>
      (book.title ?? '').toLowerCase().includes(term) ||
      (book.author ?? '').toLowerCase().includes(term) ||
      (book.category ?? '').toLowerCase().includes(term) ||
      (book.status ?? '').toLowerCase().includes(term) ||
      (book.isbn ?? '').toLowerCase().includes(term)
    );
  }

  applyFilter(): void {
    // Filtro en cliente sobre la página cargada.
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  addBook(): void {
    // No hay todavía un diálogo de creación; se deja explícito en vez de
    // simular una creación que no ocurre de verdad.
    this.snackBar.open('El formulario de alta de libros se implementará próximamente', 'Cerrar', { duration: 3000 });
  }

  editBook(book: any): void {
    const dialogRef = this.dialog.open(BookEditDialogComponent, {
      width: '600px',
      maxHeight: '90vh',
      data: { book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Libro actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.loadBooks();
      }
    });
  }

  deleteBook(book: any): void {
    const confirmed = window.confirm(`¿Eliminar el libro "${book.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.snackBar.open('Libro eliminado correctamente', 'Cerrar', { duration: 3000 });
        this.loadBooks();
      },
      error: (err) => {
        const message = err?.error?.message || 'No se pudo eliminar el libro (puede tener préstamos o reservas activas)';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      }
    });
  }

  viewBookDetails(book: any): void {
    this.snackBar.open(`${book.title} · ${book.author} · Ejemplares: ${book.availableCopies}/${book.copies} · Préstamos: ${book.loanCount ?? 0}`, 'Cerrar', { duration: 5000 });
  }

  getStatusClass(status: string): string {
    return status === 'Disponible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
}
