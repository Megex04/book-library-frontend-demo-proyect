import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LoanService } from '../../../core/services/loan.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { FineService } from '../../../core/services/fine.service';
import { BookService } from '../../../core/services/book.service';

interface ActivityItem {
  type: 'loan' | 'return' | 'reservation' | 'fine';
  title: string;
  date: Date;
  status: 'active' | 'completed' | 'pending' | 'unpaid' | 'paid';
  amount?: number;
}

interface RecommendedBook {
  id: number;
  title: string;
  authorNames: string;
  coverImageUrl?: string;
  available: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoading = true;

  userStats = {
    activeLoans: 0,
    reservations: 0,
    pendingFines: 0,
    booksRead: 0
  };

  recentActivity: ActivityItem[] = [];
  recommendedBooks: RecommendedBook[] = [];

  constructor(
    private loanService: LoanService,
    private reservationService: ReservationService,
    private fineService: FineService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      loans: this.loanService.getMyLoans(undefined, 0, 50),
      reservations: this.reservationService.getMyReservations(),
      fines: this.fineService.getMyFines(0, 50),
      recommended: this.bookService.getRecentBooks(0, 3)
    }).subscribe({
      next: ({ loans, reservations, fines, recommended }) => {
        const loanList: any[] = loans?.content ?? [];
        const reservationList: any[] = reservations ?? [];
        const fineList: any[] = fines?.content ?? [];
        const bookList: any[] = recommended?.content ?? [];

        this.userStats = {
          activeLoans: loanList.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE').length,
          reservations: reservationList.filter(r => r.status === 'PENDING' || r.status === 'READY').length,
          pendingFines: fineList.filter(f => f.status === 'PENDING').length,
          booksRead: loanList.filter(l => l.status === 'RETURNED').length
        };

        this.recentActivity = this.buildRecentActivity(loanList, reservationList, fineList);

        this.recommendedBooks = bookList.map((b: any) => ({
          id: b.id,
          title: b.title,
          authorNames: (b.authors || []).map((a: any) => a.name).join(', ') || 'Autor desconocido',
          coverImageUrl: b.coverImageUrl,
          available: b.available ?? (b.availableCopies > 0)
        }));

        this.isLoading = false;
      },
      error: (err) => {
        // Antes este bloque fallaba en silencio: si cualquiera de las 4
        // llamadas del forkJoin fallaba (por ejemplo por un 401 causado por
        // un token corrupto), el dashboard completo quedaba en ceros sin
        // ningún indicio en consola de que algo salió mal.
        console.error('Error cargando datos del dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  private buildRecentActivity(loans: any[], reservations: any[], fines: any[]): ActivityItem[] {
    const items: ActivityItem[] = [];

    for (const loan of loans) {
      if (loan.returnDate) {
        items.push({
          type: 'return',
          title: loan.bookTitle,
          date: new Date(loan.returnDate),
          status: 'completed'
        });
      } else {
        items.push({
          type: 'loan',
          title: loan.bookTitle,
          date: new Date(loan.loanDate),
          status: loan.overdue ? 'unpaid' : 'active'
        });
      }
    }

    for (const reservation of reservations) {
      items.push({
        type: 'reservation',
        title: reservation.bookTitle,
        date: new Date(reservation.reservationDate),
        status: reservation.status === 'PENDING' ? 'pending' : 'completed'
      });
    }

    for (const fine of fines) {
      items.push({
        type: 'fine',
        title: fine.bookTitle || 'Multa',
        date: new Date(fine.createdAt),
        status: fine.status === 'PAID' ? 'paid' : 'unpaid',
        amount: fine.amount
      });
    }

    return items
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }
}
