import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { Resume } from '../../core/models/resume.model';
import { ResumeAnalysis } from '../../core/models/analysis.model';

@Component({
  selector: 'app-resume-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './resume-compare.component.html',
  styleUrls: ['./resume-compare.component.scss']
})
export class ResumeCompareComponent {
  private apiService = inject(ResumeApiService);

  analyzedResumes = signal<Resume[]>([]);
  isLoadingList = signal(true);
  isLoadingComparison = signal(false);
  errorMessage = signal<string | null>(null);

  selectedIdA = signal<number | null>(null);
  selectedIdB = signal<number | null>(null);

  analysisA = signal<ResumeAnalysis | null>(null);
  analysisB = signal<ResumeAnalysis | null>(null);

  // Available options for Selection B (excluding current Selection A)
  optionsForB = computed(() => {
    const idA = this.selectedIdA();
    return this.analyzedResumes().filter(r => r.id !== idA);
  });

  // Available options for Selection A (excluding current Selection B)
  optionsForA = computed(() => {
    const idB = this.selectedIdB();
    return this.analyzedResumes().filter(r => r.id !== idB);
  });

  constructor() {
    this.loadAnalyzedResumes();

    // Effect to trigger comparisons when both selections are made
    effect(() => {
      const idA = this.selectedIdA();
      const idB = this.selectedIdB();
      
      if (idA && idB) {
        // Run compare trigger
        this.fetchComparisons(idA, idB);
      } else {
        this.analysisA.set(null);
        this.analysisB.set(null);
      }
    }, { allowSignalWrites: true });
  }

  loadAnalyzedResumes(): void {
    this.isLoadingList.set(true);
    this.apiService.getResumes().subscribe({
      next: (res) => {
        // Filter only those which have analyses completed
        this.analyzedResumes.set(res.filter(r => r.hasAnalysis));
        this.isLoadingList.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to load analyzed resumes.');
        this.isLoadingList.set(false);
      }
    });
  }

  fetchComparisons(idA: number, idB: number): void {
    this.isLoadingComparison.set(true);
    this.errorMessage.set(null);

    forkJoin({
      analysisA: this.apiService.getAnalysis(idA),
      analysisB: this.apiService.getAnalysis(idB)
    }).subscribe({
      next: (res) => {
        this.analysisA.set(res.analysisA);
        this.analysisB.set(res.analysisB);
        this.isLoadingComparison.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to load comparison data.');
        this.isLoadingComparison.set(false);
      }
    });
  }

  getSkillsIntersection(listA: string[], listB: string[]): string[] {
    return listA.filter(x => listB.includes(x));
  }

  getSkillsDifference(listA: string[], listB: string[]): string[] {
    return listA.filter(x => !listB.includes(x));
  }
}
