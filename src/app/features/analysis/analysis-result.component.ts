import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { ResumeAnalysis } from '../../core/models/analysis.model';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './analysis-result.component.html',
  styleUrls: ['./analysis-result.component.scss']
})
export class AnalysisResultComponent implements OnInit {
  private apiService = inject(ResumeApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resumeId = signal<number>(0);
  analysis = signal<ResumeAnalysis | null>(null);
  
  // States
  isLoading = signal(true);
  isAnalyzingState = signal(false);
  errorMessage = signal<string | null>(null);

  // Analysis scanner mock terminal steps
  scanSteps = signal<string[]>([]);
  allScanSteps = [
    'Initializing AI resume analyzer context...',
    'Extracting text structural content...',
    'Running resume parsing engine...',
    'Evaluating readability and parsing keywords...',
    'Comparing profile with ATS schemas...',
    'Querying Gemini AI modeling API...',
    'Interpreting analysis JSON matrix...',
    'Generating career level diagnostics...',
    'Finalizing strengths and skill gaps...',
    'Saving report to database...'
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.resumeId.set(id);
      
      const triggerAnalysis = this.route.snapshot.queryParamMap.get('runAnalysis') === 'true';
      if (triggerAnalysis) {
        this.runAnalysisProcess();
      } else {
        this.loadAnalysis();
      }
    }
  }

  loadAnalysis(): void {
    this.isLoading.set(true);
    this.isAnalyzingState.set(false);
    this.errorMessage.set(null);

    this.apiService.getAnalysis(this.resumeId()).subscribe({
      next: (res) => {
        this.analysis.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        // If analysis doesn't exist, we can offer to run it
        this.errorMessage.set(err || 'Failed to load analysis result.');
        this.isLoading.set(false);
      }
    });
  }

  runAnalysisProcess(): void {
    this.isLoading.set(true);
    this.isAnalyzingState.set(true);
    this.errorMessage.set(null);
    this.scanSteps.set([]);

    // Run scanning visual logs
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < this.allScanSteps.length) {
        this.scanSteps.update(arr => [...arr, this.allScanSteps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 350);

    // Call actual api
    this.apiService.analyzeResume(this.resumeId()).subscribe({
      next: (res) => {
        // Clear interval just in case API finishes early
        clearInterval(interval);
        
        // Make sure all steps show complete
        this.scanSteps.set(this.allScanSteps);
        
        // Hold on final state for a second so the user sees completion, then render
        setTimeout(() => {
          this.analysis.set(res);
          this.isAnalyzingState.set(false);
          this.isLoading.set(false);
          // Strip out the query param to avoid re-triggering on reload
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { runAnalysis: null },
            queryParamsHandling: 'merge'
          });
        }, 1000);
      },
      error: (err) => {
        clearInterval(interval);
        this.errorMessage.set(err || 'AI Analysis failed. Check if Gemini API is configured correctly.');
        this.isAnalyzingState.set(false);
        this.isLoading.set(false);
      }
    });
  }

  generateQuestions(): void {
    this.router.navigate(['/interview', this.resumeId()], { queryParams: { runGenerate: 'true' } });
  }

  getDashOffset(score: number): number {
    // Circumference of a circle with r=50 is 2 * PI * r = 314.16
    const circumference = 314.16;
    return circumference - (score / 100) * circumference;
  }
}
