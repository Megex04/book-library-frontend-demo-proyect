import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { BookService, BookUpdateRequest } from '../../../../core/services/book.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AuthorService } from '../../../../core/services/author.service';

export interface BookEditDialogData {
  book: any;
}

@Component({
  selector: 'app-book-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Editar libro</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <div mat-dialog-content class="flex flex-col gap-2">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" required>
          <mat-error *ngIf="form.get('title')?.hasError('required')">El título es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>ISBN</mat-label>
          <input matInput formControlName="isbn" placeholder="978-3-16-148410-0">
        </mat-form-field>

        <div class="flex gap-2">
          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Año de publicación</mat-label>
            <input matInput type="number" formControlName="publicationYear">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Edición</mat-label>
            <input matInput formControlName="edition">
          </mat-form-field>
        </div>

        <div class="flex gap-2">
          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Editorial</mat-label>
            <input matInput formControlName="publisher">
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Idioma</mat-label>
            <input matInput formControlName="language">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Ubicación física</mat-label>
          <input matInput formControlName="physicalLocation" placeholder="Estantería, sala, etc.">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Autores</mat-label>
          <mat-select formControlName="authorIds" multiple>
            <mat-option *ngFor="let author of authorOptions" [value]="author.id">
              {{author.name}}
            </mat-option>
          </mat-select>
          <mat-hint *ngIf="loadingAuthors">Cargando autores...</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Categorías</mat-label>
          <mat-select formControlName="categoryIds" multiple>
            <mat-option *ngFor="let category of categoryOptions" [value]="category.id">
              {{category.name}}
            </mat-option>
          </mat-select>
          <mat-hint *ngIf="loadingCategories">Cargando categorías...</mat-hint>
        </mat-form-field>

        <!-- Ejemplares: van por un endpoint distinto al resto de campos
             (PUT /admin/books/{id}/inventory), así que se validan aparte:
             disponibles no puede superar el total. -->
        <div class="flex gap-2">
          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Ejemplares totales</mat-label>
            <input matInput type="number" min="0" formControlName="totalCopies" required>
            <mat-error *ngIf="form.get('totalCopies')?.hasError('required')">Obligatorio</mat-error>
            <mat-error *ngIf="form.get('totalCopies')?.hasError('min')">No puede ser negativo</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-1/2">
            <mat-label>Ejemplares disponibles</mat-label>
            <input matInput type="number" min="0" formControlName="availableCopies" required>
            <mat-error *ngIf="form.get('availableCopies')?.hasError('required')">Obligatorio</mat-error>
            <mat-error *ngIf="form.get('availableCopies')?.hasError('min')">No puede ser negativo</mat-error>
          </mat-form-field>
        </div>
        <div *ngIf="form.hasError('availableExceedsTotal')" class="text-red-600 text-sm -mt-2">
          Los ejemplares disponibles no pueden superar el total.
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>URL de portada</mat-label>
          <input matInput formControlName="coverImageUrl">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <div *ngIf="errorMessage" class="text-red-600 text-sm">
          {{errorMessage}}
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSaving">
          <mat-spinner *ngIf="isSaving" diameter="18" class="inline-block mr-2"></mat-spinner>
          Guardar cambios
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class BookEditDialogComponent {
  form: FormGroup;
  authorOptions: any[] = [];
  categoryOptions: any[] = [];
  loadingAuthors = true;
  loadingCategories = true;
  isSaving = false;
  errorMessage = '';

  private bookId: number;
  private initialTotalCopies: number;
  private initialAvailableCopies: number;

  constructor(
    public dialogRef: MatDialogRef<BookEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookEditDialogData,
    private fb: FormBuilder,
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService
  ) {
    const book = data.book;
    this.bookId = book.id;
    this.initialTotalCopies = book.totalCopies ?? 0;
    this.initialAvailableCopies = book.availableCopies ?? 0;

    const currentAuthorIds = Array.isArray(book.authors) ? book.authors.map((a: any) => a.id) : [];
    const currentCategoryIds = Array.isArray(book.categories) ? book.categories.map((c: any) => c.id) : [];

    this.form = this.fb.group({
      title: [book.title ?? '', Validators.required],
      isbn: [book.isbn ?? ''],
      publicationYear: [book.publicationYear ?? null],
      edition: [book.edition ?? ''],
      publisher: [book.publisher ?? ''],
      language: [book.language ?? ''],
      physicalLocation: [book.physicalLocation ?? ''],
      authorIds: [currentAuthorIds],
      categoryIds: [currentCategoryIds],
      totalCopies: [this.initialTotalCopies, [Validators.required, Validators.min(0)]],
      availableCopies: [this.initialAvailableCopies, [Validators.required, Validators.min(0)]],
      coverImageUrl: [book.coverImageUrl ?? ''],
      description: [book.description ?? '']
    }, { validators: this.availableNotOverTotalValidator });

    this.authorService.getAllAuthors(0, 200).subscribe({
      next: (response) => {
        this.authorOptions = response?.content ?? [];
        this.loadingAuthors = false;
      },
      error: () => {
        this.authorOptions = [];
        this.loadingAuthors = false;
      }
    });

    this.categoryService.getAllCategories(0, 100).subscribe({
      next: (response) => {
        this.categoryOptions = response?.content ?? [];
        this.loadingCategories = false;
      },
      error: () => {
        this.categoryOptions = [];
        this.loadingCategories = false;
      }
    });
  }

  private availableNotOverTotalValidator(group: FormGroup) {
    const total = group.get('totalCopies')?.value;
    const available = group.get('availableCopies')?.value;
    if (total != null && available != null && Number(available) > Number(total)) {
      return { availableExceedsTotal: true };
    }
    return null;
  }

  submit(): void {
    if (this.form.invalid || this.isSaving) {
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    const value = this.form.value;
    const request: BookUpdateRequest = {
      title: value.title,
      isbn: value.isbn || undefined,
      publicationYear: value.publicationYear ?? undefined,
      edition: value.edition || undefined,
      publisher: value.publisher || undefined,
      language: value.language || undefined,
      physicalLocation: value.physicalLocation || undefined,
      authorIds: value.authorIds && value.authorIds.length > 0 ? value.authorIds : undefined,
      categoryIds: value.categoryIds && value.categoryIds.length > 0 ? value.categoryIds : undefined,
      coverImageUrl: value.coverImageUrl || undefined,
      description: value.description || undefined
    };

    const inventoryChanged = value.totalCopies !== this.initialTotalCopies
      || value.availableCopies !== this.initialAvailableCopies;

    // updateBook y updateBookInventory son dos endpoints distintos en el
    // backend (PUT /admin/books/{id} y PUT /admin/books/{id}/inventory);
    // se encadenan para que el diálogo se comporte como un solo guardado.
    this.bookService.updateBook(this.bookId, request).pipe(
      switchMap((updatedBook) => {
        if (!inventoryChanged) {
          return of(updatedBook);
        }
        return this.bookService.updateBookInventory(this.bookId, value.totalCopies, value.availableCopies);
      })
    ).subscribe({
      next: (finalBook) => {
        this.isSaving = false;
        this.dialogRef.close(finalBook);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'No se pudo actualizar el libro';
      }
    });
  }
}
