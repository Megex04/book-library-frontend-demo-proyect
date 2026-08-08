import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

interface ReportData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  selectedReportType: string = 'circulation';
  selectedPeriod: string = 'month';
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 1));
  endDate: Date = new Date();
  
  // Datos simulados para los informes
  circulationData: ReportData[] = [
    { label: 'Préstamos', value: 245, color: 'bg-blue-500' },
    { label: 'Devoluciones', value: 198, color: 'bg-green-500' },
    { label: 'Renovaciones', value: 87, color: 'bg-purple-500' },
    { label: 'Reservas', value: 56, color: 'bg-yellow-500' }
  ];

  collectionData: ReportData[] = [
    { label: 'Ficción', value: 1250, color: 'bg-red-500' },
    { label: 'No ficción', value: 980, color: 'bg-blue-500' },
    { label: 'Referencia', value: 340, color: 'bg-green-500' },
    { label: 'Digital', value: 560, color: 'bg-purple-500' },
    { label: 'Multimedia', value: 210, color: 'bg-yellow-500' }
  ];

  userActivityData: ReportData[] = [
    { label: 'Nuevos usuarios', value: 78, color: 'bg-blue-500' },
    { label: 'Usuarios activos', value: 423, color: 'bg-green-500' },
    { label: 'Usuarios inactivos', value: 156, color: 'bg-red-500' }
  ];

  finesData: ReportData[] = [
    { label: 'Multas emitidas', value: 67, color: 'bg-red-500' },
    { label: 'Multas pagadas', value: 42, color: 'bg-green-500' },
    { label: 'Multas pendientes', value: 25, color: 'bg-yellow-500' },
    { label: 'Ingresos por multas', value: 385, color: 'bg-blue-500' } // En euros
  ];

  // Datos para gráficos mensuales (simulados)
  monthlyLabels: string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  monthlyCirculation: number[] = [120, 135, 150, 142, 160, 175, 190, 185, 200, 220, 235, 245];
  monthlyNewUsers: number[] = [25, 30, 28, 35, 40, 38, 45, 50, 55, 60, 65, 78];
  monthlyFines: number[] = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 67];

  constructor() { }

  ngOnInit(): void {
    // Aquí se cargarían los datos reales desde un servicio
  }

  generateReport(): void {
    console.log('Generando informe:', {
      tipo: this.selectedReportType,
      periodo: this.selectedPeriod,
      fechaInicio: this.startDate,
      fechaFin: this.endDate
    });
    // Aquí se implementaría la lógica para generar el informe con los filtros seleccionados
  }

  exportToPDF(): void {
    console.log('Exportando a PDF');
    // Implementar lógica para exportar a PDF
  }

  exportToExcel(): void {
    console.log('Exportando a Excel');
    // Implementar lógica para exportar a Excel
  }

  printReport(): void {
    console.log('Imprimiendo informe');
    // Implementar lógica para imprimir
  }

  // Método para obtener los datos según el tipo de informe seleccionado
  getReportData(): ReportData[] {
    switch(this.selectedReportType) {
      case 'circulation':
        return this.circulationData;
      case 'collection':
        return this.collectionData;
      case 'users':
        return this.userActivityData;
      case 'fines':
        return this.finesData;
      default:
        return this.circulationData;
    }
  }

  // Método para calcular el total de los valores en el informe actual
  getTotal(): number {
    return this.getReportData().reduce((sum, item) => sum + item.value, 0);
  }

  // Método para calcular el porcentaje de cada ítem
  getPercentage(value: number): number {
    const total = this.getTotal();
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  // Método para formatear valores monetarios
  formatCurrency(value: number): string {
    return value.toFixed(2) + ' €';
  }
}