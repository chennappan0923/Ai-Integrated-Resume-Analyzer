import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { InterviewQuestion } from '../../core/models/interview.model';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit {
  private apiService = inject(ResumeApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resumeId = signal<number>(0);
  questions = signal<InterviewQuestion[]>([]);
  
  // States
  isLoading = signal(true);
  isGeneratingState = signal(false);
  errorMessage = signal<string | null>(null);

  // Category filters
  selectedCategory = signal<string>('All');
  categories = ['All', 'Technical', 'Behavioral', 'HR', 'Scenario'];

  // Accordion active index
  activeQuestionId = signal<number | null>(null);

  // Computed filtered questions list
  filteredQuestions = computed(() => {
    const list = this.questions();
    const category = this.selectedCategory();
    if (category === 'All') return list;
    return list.filter(q => q.category === category);
  });

  // Scanner/Generator logs
  generatorSteps = signal<string[]>([]);
  allGeneratorSteps = [
    'Retrieving candidate resume context...',
    'Loading skill gaps and career details...',
    'Formulating tailored prompts for interviewers...',
    'Initiating Gemini generative AI request...',
    'Composing technical assessment criteria...',
    'Drafting situational scenario questions...',
    'Structuring behavioral role scenarios...',
    'Filtering for target HR screening criteria...',
    'Compiling questions JSON response...',
    'Storing tailored questions database records...'
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.resumeId.set(id);

      const triggerGenerate = this.route.snapshot.queryParamMap.get('runGenerate') === 'true';
      if (triggerGenerate) {
        this.runGenerateProcess();
      } else {
        this.loadQuestions();
      }
    }
  }

  loadQuestions(): void {
    this.isLoading.set(true);
    this.isGeneratingState.set(false);
    this.errorMessage.set(null);

    this.apiService.getQuestions(this.resumeId()).subscribe({
      next: (res) => {
        this.questions.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        // If not found, let's offer to generate
        this.isLoading.set(false);
      }
    });
  }

  runGenerateProcess(): void {
    this.isLoading.set(true);
    this.isGeneratingState.set(true);
    this.errorMessage.set(null);
    this.generatorSteps.set([]);

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < this.allGeneratorSteps.length) {
        this.generatorSteps.update(arr => [...arr, this.allGeneratorSteps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 350);

    this.apiService.generateQuestions(this.resumeId()).subscribe({
      next: (res) => {
        clearInterval(interval);
        this.generatorSteps.set(this.allGeneratorSteps);
        
        setTimeout(() => {
          this.questions.set(res);
          this.isGeneratingState.set(false);
          this.isLoading.set(false);
          
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { runGenerate: null },
            queryParamsHandling: 'merge'
          });
        }, 1000);
      },
      error: (err) => {
        clearInterval(interval);
        this.errorMessage.set(err || 'Failed to generate interview questions. Try re-analyzing the resume first.');
        this.isGeneratingState.set(false);
        this.isLoading.set(false);
      }
    });
  }

  toggleAccordion(id: number): void {
    this.activeQuestionId.update(current => current === id ? null : id);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
    this.activeQuestionId.set(null);
  }

  downloadQuestions(): void {
    const list = this.filteredQuestions();
    if (list.length === 0) return;

    let text = `AI Tailored Interview Questions\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n`;
    text += `==========================================\n\n`;

    list.forEach((q, idx) => {
      text += `${idx + 1}. [${q.category}] ${q.question}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Questions_Resume_${this.resumeId()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
