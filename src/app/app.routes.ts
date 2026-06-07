import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'resumes',
        loadComponent: () => import('./features/resumes/resume-list.component').then(m => m.ResumeListComponent)
      },
      {
        path: 'resumes/upload',
        loadComponent: () => import('./features/resumes/upload.component').then(m => m.UploadComponent)
      },
      {
        path: 'resumes/compare',
        loadComponent: () => import('./features/resumes/resume-compare.component').then(m => m.ResumeCompareComponent)
      },
      {
        path: 'analysis/history',
        loadComponent: () => import('./features/analysis/analysis-history.component').then(m => m.AnalysisHistoryComponent)
      },
      {
        path: 'analysis/:id',
        loadComponent: () => import('./features/analysis/analysis-result.component').then(m => m.AnalysisResultComponent)
      },
      {
        path: 'interview/:id',
        loadComponent: () => import('./features/interview/question-list.component').then(m => m.QuestionListComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

