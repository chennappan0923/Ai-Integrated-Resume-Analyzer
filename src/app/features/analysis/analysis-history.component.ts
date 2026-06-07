import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { AnalysisHistoryItem } from '../../core/models/analysis.model';

@Component({
  selector: 'app-analysis-history',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './analysis-history.component.html',
  styleUrls: ['./analysis-history.component.scss']
})
export class AnalysisHistoryComponent {
  private apiService = inject(ResumeApiService);

  history = signal<AnalysisHistoryItem[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.apiService.getAnalysisHistory().subscribe({
      next: (res) => {
        this.history.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to load analysis history.');
        this.isLoading.set(false);
      }
    });
  }
}
