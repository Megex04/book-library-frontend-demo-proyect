import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: string;
  publishedYear: number;
  copies: number;
  availableCopies: number;
}

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
  displayedColumns: string[] = ['id', 'title', 'author', 'category', 'status', 'copies', 'actions'];
  dataSource: Book[] = [];
  searchTerm: string = '';
  filteredData: Book[] = [];

  constructor() { }

  ngOnInit(): void {
    // Simular datos de libros (reemplazar con llamada a API real)
    this.dataSource = [
      {
        id: 1,
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        isbn: '978-0307474728',
        category: 'Ficción',
        status: 'Disponible',
        publishedYear: 1967,
        copies: 5,
        availableCopies: 3
      },
      {
        id: 2,
        title: 'El principito',
        author: 'Antoine de Saint-Exupéry',
        isbn: '978-0156012195',
        category: 'Infantil',
        status: 'Disponible',
        publishedYear: 1943,
        copies: 8,
        availableCopies: 5
      },
      {
        id: 3,
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        category: 'Ciencia Ficción',
        status: 'Agotado',
        publishedYear: 1949,
        copies: 3,
        availableCopies: 0
      },
      {
        id: 4,
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        isbn: '978-8420412146',
        category: 'Clásico',
        status: 'Disponible',
        publishedYear: 1605,
        copies: 4,
        availableCopies: 2
      },
      {
        id: 5,
        title: 'Harry Potter y la piedra filosofal',
        author: 'J.K. Rowling',
        isbn: '978-0590353427',
        category: 'Fantasía',
        status: 'Disponible',
        publishedYear: 1997,
        copies: 10,
        availableCopies: 7
      }
    ];
    this.filteredData = [...this.dataSource];
  }

  applyFilter(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredData = this.dataSource.filter(book => 
      book.title.toLowerCase().includes(searchTermLower) ||
      book.author.toLowerCase().includes(searchTermLower) ||
      book.category.toLowerCase().includes(searchTermLower) ||
      book.status.toLowerCase().includes(searchTermLower) ||
      book.isbn.toLowerCase().includes(searchTermLower)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredData = [...this.dataSource];
  }

  addBook(): void {
    // Implementar lógica para abrir diálogo de creación de libro
    console.log('Agregar libro');
  }

  editBook(book: Book): void {
    // Implementar lógica para abrir diálogo de edición de libro
    console.log('Editar libro', book);
  }

  deleteBook(book: Book): void {
    // Implementar lógica para confirmar y eliminar libro
    console.log('Eliminar libro', book);
  }

  viewBookDetails(book: Book): void {
    // Implementar lógica para ver detalles del libro
    console.log('Ver detalles del libro', book);
  }

  getStatusClass(status: string): string {
    return status === 'Disponible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
}