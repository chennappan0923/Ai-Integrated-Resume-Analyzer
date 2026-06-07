import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { DashboardSummary } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private apiService = inject(ResumeApiService);
  
  // Dashboard state signal
  summary = signal<DashboardSummary | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  private _trendCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('trendCanvas') set trendCanvas(canvas: ElementRef<HTMLCanvasElement> | undefined) {
    this._trendCanvas = canvas;
    if (canvas && this.summary()) {
      setTimeout(() => this.drawTrendChart(this.summary()!), 50);
    }
  }

  constructor() {
    this.loadDashboardData();

    // Effect to redraw the chart whenever the summary changes or canvas is loaded
    effect(() => {
      const data = this.summary();
      if (data && this._trendCanvas) {
        // Run after rendering completes
        setTimeout(() => this.drawTrendChart(data), 50);
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.apiService.getDashboardSummary().subscribe({
      next: (res) => {
        this.summary.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err || 'Failed to load dashboard statistics.');
        this.isLoading.set(false);
      }
    });
  }

  drawTrendChart(data: DashboardSummary): void {
    const canvas = this._trendCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const trends = data.scoreTrends || [];
    if (trends.length === 0) {
      // Draw placeholder text
      ctx.fillStyle = '#8f9cae';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('No history data available yet. Analyze a resume to see trends.', canvas.width / 2, canvas.height / 2);
      return;
    }

    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    const maxVal = 100;
    const minVal = 0;

    const pointsCount = trends.length;
    const xInterval = pointsCount > 1 ? width / (pointsCount - 1) : width;

    // Draw Grid Lines & Y-axis labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#5e6b7e';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i++) {
      const yVal = 25 * i;
      const y = padding + height - (yVal / 100) * height;
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();

      // Label
      ctx.fillText(yVal.toString(), padding - 10, y + 4);
    }

    // Draw X-axis Labels (resume names)
    ctx.fillStyle = '#8f9cae';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    
    trends.forEach((item, index) => {
      const x = padding + index * xInterval;
      const label = item.resumeName.length > 12 ? item.resumeName.substring(0, 10) + '...' : item.resumeName;
      ctx.fillText(label, x, padding + height + 20);
    });

    // 1. Draw ATS Score Line (Neon Cyan)
    this.drawLine(ctx, trends.map(t => t.atsScore), padding, height, xInterval, '#00f2fe', 'rgba(0, 242, 254, 0.1)');

    // 2. Draw Resume Score Line (Neon Purple)
    this.drawLine(ctx, trends.map(t => t.resumeScore), padding, height, xInterval, '#8a2be2', 'rgba(138, 43, 226, 0.1)');
  }

  private drawLine(
    ctx: CanvasRenderingContext2D, 
    values: number[], 
    padding: number, 
    height: number, 
    xInterval: number, 
    strokeColor: string, 
    fillColor: string
  ): void {
    if (values.length === 0) return;

    // Line Path
    ctx.beginPath();
    values.forEach((val, index) => {
      const x = padding + index * xInterval;
      const y = padding + height - (val / 100) * height;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Reset shadow for subsequent drawings
    ctx.shadowBlur = 0;

    // Fill Area under line
    ctx.beginPath();
    ctx.moveTo(padding, padding + height);
    values.forEach((val, index) => {
      const x = padding + index * xInterval;
      const y = padding + height - (val / 100) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (values.length - 1) * xInterval, padding + height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Data points (dots)
    values.forEach((val, index) => {
      const x = padding + index * xInterval;
      const y = padding + height - (val / 100) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  }
}
