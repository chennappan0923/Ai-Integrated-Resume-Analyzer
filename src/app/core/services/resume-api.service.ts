import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resume } from '../models/resume.model';
import { ResumeAnalysis, AnalysisHistoryItem } from '../models/analysis.model';
import { InterviewQuestion } from '../models/interview.model';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class ResumeApiService {
  private baseApiUrl = 'http://localhost:5245/api';

  constructor(private http: HttpClient) {}

  // ==========================================
  // Resume Endpoints
  // ==========================================
  uploadResume(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseApiUrl}/resumes/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(`${this.baseApiUrl}/resumes`);
  }

  getResumeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/resumes/${id}`);
  }

  deleteResume(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseApiUrl}/resumes/${id}`);
  }

  downloadResume(id: number): Observable<Blob> {
    return this.http.get(`${this.baseApiUrl}/resumes/download/${id}`, {
      responseType: 'blob'
    });
  }

  // ==========================================
  // Analysis Endpoints
  // ==========================================
  analyzeResume(resumeId: number): Observable<ResumeAnalysis> {
    return this.http.post<ResumeAnalysis>(`${this.baseApiUrl}/analysis/${resumeId}`, {});
  }

  getAnalysis(resumeId: number): Observable<ResumeAnalysis> {
    return this.http.get<ResumeAnalysis>(`${this.baseApiUrl}/analysis/${resumeId}`);
  }

  getAnalysisHistory(): Observable<AnalysisHistoryItem[]> {
    return this.http.get<AnalysisHistoryItem[]>(`${this.baseApiUrl}/analysis/history`);
  }

  // ==========================================
  // Interview Endpoints
  // ==========================================
  generateQuestions(resumeId: number): Observable<InterviewQuestion[]> {
    return this.http.post<InterviewQuestion[]>(`${this.baseApiUrl}/interview/generate/${resumeId}`, {});
  }

  getQuestions(resumeId: number): Observable<InterviewQuestion[]> {
    return this.http.get<InterviewQuestion[]>(`${this.baseApiUrl}/interview/${resumeId}`);
  }

  // ==========================================
  // Dashboard Endpoints
  // ==========================================
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseApiUrl}/dashboard/summary`);
  }

  // ==========================================
  // Profile Endpoints
  // ==========================================
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/profile`);
  }

  updateProfile(data: { fullName: string; email: string }): Observable<any> {
    return this.http.put<any>(`${this.baseApiUrl}/profile`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.put<any>(`${this.baseApiUrl}/profile/change-password`, data);
  }
}
