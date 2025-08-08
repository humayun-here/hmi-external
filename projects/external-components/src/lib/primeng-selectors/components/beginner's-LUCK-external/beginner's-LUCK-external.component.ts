// beginner's-luck.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-beginner\'s-luck',
  template: `
    <!-- 
      Features:
      - EMI Calculator with principal, rate, and tenure inputs.
      - Shows monthly EMI, total payment, and total interest.
      - Data auto-saved in browser (local storage).
      - Download/Upload your calculation data as .txt file.
      - Responsive Bootstrap 5 styling with PrimeIcons for icons.
    -->
    <div class="card shadow mt-4 mx-auto" style="max-width: 500px;">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>
          <i class="pi pi-calculator me-2"></i>
          EMI Calculator
        </span>
        <div>
          <button type="button" class="btn btn-sm btn-outline-primary me-2"
            (click)="downloadData()" title="Download Data">
            <i class="pi pi-download"></i>
          </button>
          <label class="btn btn-sm btn-outline-secondary mb-0" title="Upload Data">
            <i class="pi pi-upload"></i>
            <input type="file" accept=".txt" hidden (change)="uploadData($event)">
          </label>
        </div>
      </div>
      <div class="card-body">
        <form (ngSubmit)="calculateEMI()" autocomplete="off">
          <div class="mb-3">
            <label for="principal" class="form-label">Principal Amount (₹)</label>
            <input type="number" id="principal" class="form-control" required min="1"
              [(ngModel)]="emiData.principal" name="principal" (change)="saveData()">
          </div>
          <div class="mb-3">
            <label for="rate" class="form-label">Interest Rate (% per annum)</label>
            <input type="number" id="rate" class="form-control" required min="0.01" step="0.01"
              [(ngModel)]="emiData.rate" name="rate" (change)="saveData()">
          </div>
          <div class="mb-3">
            <label for="tenure" class="form-label">Tenure (months)</label>
            <input type="number" id="tenure" class="form-control" required min="1"
              [(ngModel)]="emiData.tenure" name="tenure" (change)="saveData()">
          </div>
          <button type="submit" class="btn btn-success w-100">
            <i class="pi pi-check-circle me-2"></i>Calculate EMI
          </button>
        </form>
        <div *ngIf="emiResult" class="mt-4 border-top pt-3">
          <h6><i class="pi pi-info-circle text-primary me-2"></i>Results</h6>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between">
              <span>Monthly EMI:</span>
              <strong>₹{{ emiResult.emi | number:'1.2-2' }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Total Payment:</span>
              <strong>₹{{ emiResult.totalPayment | number:'1.2-2' }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Total Interest:</span>
              <strong>₹{{ emiResult.totalInterest | number:'1.2-2' }}</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: #fdfdfd; }
    .form-label { font-weight: 500; }
    .list-group-item { font-size: 1rem; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class BeginnerSLUCKComponent extends CommonExternalComponent {
  emiData: { principal: number; rate: number; tenure: number } = {
    principal: 100000,
    rate: 8.5,
    tenure: 12
  };
  emiResult: { emi: number; totalPayment: number; totalInterest: number } | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.loadData();
    this.calculateEMI();
  }

  saveData(): void {
    localStorage.setItem('beginnersLuckEmiData', JSON.stringify(this.emiData));
  }

  loadData(): void {
    const data = localStorage.getItem('beginnersLuckEmiData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (
          typeof parsed.principal === 'number' &&
          typeof parsed.rate === 'number' &&
          typeof parsed.tenure === 'number'
        ) {
          this.emiData = parsed;
        }
      } catch {}
    }
  }

  calculateEMI(): void {
    const P: number = this.emiData.principal;
    const R: number = this.emiData.rate / 12 / 100;
    const N: number = this.emiData.tenure;
    let emi: number = 0;
    if (R > 0 && N > 0) {
      emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    }
    const totalPayment: number = emi * N;
    const totalInterest: number = totalPayment - P;
    this.emiResult = {
      emi: emi || 0,
      totalPayment: totalPayment || 0,
      totalInterest: totalInterest || 0
    };
    this.saveData();
  }

  downloadData(): void {
    const dataToDownload = {
      emiData: this.emiData
    };
    this.componentDataDownloader(dataToDownload);
  }

  async uploadData(event: Event): Promise<void> {
    const result = await this.componentDataUploader(event);
    if (result && result.emiData) {
      this.emiData = {
        principal: Number(result.emiData.principal) || 0,
        rate: Number(result.emiData.rate) || 0,
        tenure: Number(result.emiData.tenure) || 0
      };
      this.calculateEMI();
      this.cdr.detectChanges();
      this.saveData();
    }
  }
}