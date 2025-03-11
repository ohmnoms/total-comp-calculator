import { Component, OnInit, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [MatButtonModule, MatFormFieldModule, 
    MatCardModule, MatDividerModule, MatInputModule,
    CommonModule, ReactiveFormsModule, FormsModule, MatToolbarModule
  ]
})
export class AppComponent implements OnInit {
  title = 'Compensation Calculator';

  // Form inputs
  baseSalary = 0;
  performanceBonus = 0;
  stockEquity = 0;
  otherBonuses = 0;
  healthInsurance = 0;
  dentalVision = 0;
  retirementMatch = 0;
  lifeDisability = 0;
  ptoValue = 0;
  tuitionStipend = 0;
  wellnessGym = 0;
  commuterTravel = 0;
  officeStipend = 0;

  // Computed
  bonusesSubtotal = 0;
  benefitsSubtotal = 0;
  perksSubtotal = 0;
  totalCompensation = 0;
  monthlyCompensation = 0;

  private compChart: Chart | undefined;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // Determine if we’re in the browser (true) or on the server (false)
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Load data only if browser
    if (this.isBrowser) {
      const savedData = localStorage.getItem('compData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.baseSalary = parsed.baseSalary || 0;
        this.performanceBonus = parsed.performanceBonus || 0;
        this.stockEquity = parsed.stockEquity || 0;
        this.otherBonuses = parsed.otherBonuses || 0;
        this.healthInsurance = parsed.healthInsurance || 0;
        this.dentalVision = parsed.dentalVision || 0;
        this.retirementMatch = parsed.retirementMatch || 0;
        this.lifeDisability = parsed.lifeDisability || 0;
        this.ptoValue = parsed.ptoValue || 0;
        this.tuitionStipend = parsed.tuitionStipend || 0;
        this.wellnessGym = parsed.wellnessGym || 0;
        this.commuterTravel = parsed.commuterTravel || 0;
        this.officeStipend = parsed.officeStipend || 0;
      }
    }

    // Immediately calculate on init so the user sees values/graph (if in browser)
    this.calculateTotals();
  }

  calculateTotals() {
    this.bonusesSubtotal = this.performanceBonus + this.stockEquity + this.otherBonuses;
    this.benefitsSubtotal = this.healthInsurance + this.dentalVision + this.retirementMatch + this.lifeDisability;
    this.perksSubtotal = this.tuitionStipend + this.wellnessGym + this.commuterTravel + this.officeStipend;

    this.totalCompensation =
      this.baseSalary +
      this.bonusesSubtotal +
      this.benefitsSubtotal +
      this.ptoValue +
      this.perksSubtotal;

    this.monthlyCompensation = this.totalCompensation / 12;

    // Save data to localStorage only if browser
    if (this.isBrowser) {
      this.saveToLocalStorage();
      this.updateChart();
    }
  }

  private saveToLocalStorage() {
    const data = {
      baseSalary: this.baseSalary,
      performanceBonus: this.performanceBonus,
      stockEquity: this.stockEquity,
      otherBonuses: this.otherBonuses,
      healthInsurance: this.healthInsurance,
      dentalVision: this.dentalVision,
      retirementMatch: this.retirementMatch,
      lifeDisability: this.lifeDisability,
      ptoValue: this.ptoValue,
      tuitionStipend: this.tuitionStipend,
      wellnessGym: this.wellnessGym,
      commuterTravel: this.commuterTravel,
      officeStipend: this.officeStipend
    };
    localStorage.setItem('compData', JSON.stringify(data));
  }

  private updateChart() {
    // If chart already exists, destroy to avoid duplicates
    if (this.compChart) {
      this.compChart.destroy();
    }

    // We'll only do chart creation if isBrowser is true
    if (!this.isBrowser || this.totalCompensation <= 0) {
      return;
    }

    const ctx = document.getElementById('compChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.compChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Base Salary', 'Bonuses', 'Benefits', 'PTO', 'Perks'],
        datasets: [
          {
            data: [
              this.baseSalary,
              this.bonusesSubtotal,
              this.benefitsSubtotal,
              this.ptoValue,
              this.perksSubtotal
            ]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        }
      }
    } as ChartConfiguration);
  }
}
