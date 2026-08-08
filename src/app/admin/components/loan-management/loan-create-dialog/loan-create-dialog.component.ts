import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { BookService } from '../../../../core/services/book.service';
import { UserService } from '../../../../core/services/user.service';
import { LoanService, LoanCreateRequest } from '../../../../core/services/loan.service';

@Component({
  selector: 'app-loan-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Nuevo préstamo</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <div mat-dialog-content class="flex flex-col gap-2">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Libro</mat-label>
          <input matInput
                 formControlName="bookQuery"
                 [matAutocomplete]="bookAuto"
                 placeholder="Escribe el título del libro">
          <mat-autocomplete #bookAuto="matAutocomplete" [displayWith]="displayBook" (optionSelected)="onBookSelected($event.option.value)">
            <mat-option *ngFor="let book of bookOptions" [value]="book">
              {{book.title}} — {{book.availableCopies}} disponibles
            </mat-option>
          </mat-autocomplete>
          <mat-hint *ngIf="!selectedBook">Selecciona un libro de la lista</mat-hint>
          <mat-error *ngIf="form.get('bookQuery')?.touched && !selectedBook">
            Debes seleccionar un libro válido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Usuario</mat-label>
          <input matInput
                 formControlName="userQuery"
                 [matAutocomplete]="userAuto"
                 placeholder="Escribe el nombre o email del usuario">
          <mat-autocomplete #userAuto="matAutocomplete" [displayWith]="displayUser" (optionSelected)="onUserSelected($event.option.value)">
            <mat-option *ngFor="let user of userOptions" [value]="user">
              {{user.firstName}} {{user.lastName}} ({{user.email}})
            </mat-option>
          </mat-autocomplete>
          <mat-hint *ngIf="!selectedUser">Selecciona un usuario de la lista</mat-hint>
          <mat-error *ngIf="form.get('userQuery')?.touched && !selectedUser">
            Debes seleccionar un usuario válido
          </mat-error>
        </mat-form-field>

        <div *ngIf="selectedBook && selectedBook.availableCopies <= 0" class="text-red-600 text-sm">
          <mat-icon class="align-middle text-sm mr-1">warning</mat-icon>
          Este libro no tiene copias disponibles actualmente.
        </div>

        <div *ngIf="errorMessage" class="text-red-600 text-sm">
          {{errorMessage}}
        </div>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary" type="submit"
                [disabled]="!selectedBook || !selectedUser || isSaving">
          <mat-spinner *ngIf="isSaving" diameter="18" class="inline-block mr-2"></mat-spinner>
          Crear préstamo
        </button>
      </div>
    </form>
  `,
  styles: []
})
export class LoanCreateDialogComponent {
  form: FormGroup;
  bookOptions: any[] = [];
  userOptions: any[] = [];
  selectedBook: any = null;
  selectedUser: any = null;
  isSaving = false;
  errorMessage = '';

  private bookQuery$ = new Subject<string>();
  private userQuery$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<LoanCreateDialogComponent>,
    private fb: FormBuilder,
    private bookService: BookService,
    private userService: UserService,
    private loanService: LoanService
  ) {
    this.form = this.fb.group({
      bookQuery: ['', Validators.required],
      userQuery: ['', Validators.required]
    });

    this.form.get('bookQuery')!.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.selectedBook = null;
        this.bookQuery$.next(value);
      }
    });

    this.form.get('userQuery')!.valueChanges.subscribe(value => {
      if (typeof value === 'string') {
        this.selectedUser = null;
        this.userQuery$.next(value);
      }
    });

    this.bookQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchBooks(query))
    ).subscribe(books => this.bookOptions = books);

    this.userQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchUsers(query))
    ).subscribe(users => this.userOptions = users);
  }

  private searchBooks(query: string): Observable<any[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }
    return this.bookService.searchBooks(query, undefined, undefined, undefined, undefined, undefined, false, 0, 10).pipe(
      switchMap((response: any) => of(response?.content ?? [])),
      catchError(() => of([]))
    );
  }

  private searchUsers(query: string): Observable<any[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }
    return this.userService.searchUsers(query, 0, 10).pipe(
      switchMap((response: any) => of(response?.content ?? [])),
      catchError(() => of([]))
    );
  }

  displayBook(book: any): string {
    return book?.title ?? '';
  }

  displayUser(user: any): string {
    return user ? `${user.firstName} ${user.lastName} (${user.email})` : '';
  }

  onBookSelected(book: any): void {
    this.selectedBook = book;
  }

  onUserSelected(user: any): void {
    this.selectedUser = user;
  }

  submit(): void {
    if (!this.selectedBook || !this.selectedUser || this.isSaving) {
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    const request: LoanCreateRequest = {
      bookId: this.selectedBook.id,
      userId: this.selectedUser.id
    };

    this.loanService.createLoan(request).subscribe({
      next: (loan) => {
        this.isSaving = false;
        this.dialogRef.close(loan);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'No se pudo crear el préstamo';
      }
    });
  }
}
