import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  private apiService = inject(ResumeApiService);
  private router = inject(Router);

  isDragOver = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  errorMessage = signal<string | null>(null);
  isSuccess = signal(false);
  selectedFile = signal<File | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.validateAndSelectFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      this.validateAndSelectFile(file);
    }
  }

  validateAndSelectFile(file: File): void {
    this.errorMessage.set(null);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension !== 'pdf' && extension !== 'docx') {
      this.errorMessage.set('Unsupported file format. Please upload a PDF or DOCX file.');
      this.selectedFile.set(null);
      return;
    }

    // Maximum file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('File is too large. Maximum size allowed is 5MB.');
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);

    this.apiService.uploadResume(file).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress.set(Math.round((100 * event.loaded) / event.total));
          }
        } else if (event.type === HttpEventType.Response) {
          this.isSuccess.set(true);
          this.uploadProgress.set(100);
          setTimeout(() => {
            this.router.navigate(['/resumes']);
          }, 1200);
        }
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to upload the file. Please try again.');
        this.isUploading.set(false);
      }
    });
  }

  clearSelection(): void {
    this.selectedFile.set(null);
    this.errorMessage.set(null);
  }
}
