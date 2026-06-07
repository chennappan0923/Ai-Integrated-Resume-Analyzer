import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { Resume } from '../../core/models/resume.model';

@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule],
  templateUrl: './resume-list.component.html',
  styleUrls: ['./resume-list.component.scss']
})
export class ResumeListComponent {
  private apiService = inject(ResumeApiService);
  private router = inject(Router);

  resumes = signal<Resume[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Search & Filter state signals
  searchQuery = signal('');
  sortBy = signal<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');
  filterBy = signal<'all' | 'analyzed' | 'pending'>('all');

  // Computed filtered & sorted list
  filteredResumes = computed(() => {
    let list = [...this.resumes()];

    // Search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(r => 
        r.resumeName.toLowerCase().includes(query) || 
        r.originalFileName.toLowerCase().includes(query)
      );
    }

    // Filter status
    const filter = this.filterBy();
    if (filter === 'analyzed') {
      list = list.filter(r => r.hasAnalysis);
    } else if (filter === 'pending') {
      list = list.filter(r => !r.hasAnalysis);
    }

    // Sort order
    const sort = this.sortBy();
    if (sort === 'date_desc') {
      list.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
    } else if (sort === 'date_asc') {
      list.sort((a, b) => new Date(a.uploadedDate).getTime() - new Date(b.uploadedDate).getTime());
    } else if (sort === 'name_asc') {
      list.sort((a, b) => a.resumeName.localeCompare(b.resumeName));
    }

    return list;
  });

  constructor() {
    this.loadResumes();
  }

  loadResumes(): void {
    this.isLoading.set(true);
    this.apiService.getResumes().subscribe({
      next: (res) => {
        this.resumes.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to load resumes.');
        this.isLoading.set(false);
      }
    });
  }

  viewResume(resume: Resume): void {
    if (resume.hasAnalysis) {
      this.router.navigate(['/analysis', resume.id]);
    } else {
      // Trigger new analysis first, then go to page
      this.router.navigate(['/analysis', resume.id], { queryParams: { runAnalysis: 'true' } });
    }
  }

  analyzeResume(resumeId: number): void {
    this.router.navigate(['/analysis', resumeId], { queryParams: { runAnalysis: 'true' } });
  }

  downloadResume(resume: Resume): void {
    this.apiService.downloadResume(resume.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resume.originalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Failed to download file. Please try again.');
      }
    });
  }

  deleteResume(resumeId: number): void {
    if (confirm('Are you sure you want to delete this resume? All associated analysis and questions will be permanently removed.')) {
      this.apiService.deleteResume(resumeId).subscribe({
        next: () => {
          // Remove from local signal
          this.resumes.update(list => list.filter(r => r.id !== resumeId));
        },
        error: (err) => {
          alert(err || 'Failed to delete resume.');
        }
      });
    }
  }
}
