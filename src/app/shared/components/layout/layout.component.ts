import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatMenuModule, MatButtonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  authService = inject(AuthService);
  
  // Mobile menu open state signal
  isMobileMenuOpen = signal(false);

  // Current page title state signal
  currentPageTitle = signal('Dashboard');

  menuItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'My Resumes', route: '/resumes', icon: 'description' },
    { label: 'Upload Resume', route: '/resumes/upload', icon: 'upload_file' },
    { label: 'Resume Comparison', route: '/resumes/compare', icon: 'compare' },
    { label: 'Analysis History', route: '/analysis/history', icon: 'history' },
    { label: 'Profile', route: '/profile', icon: 'person' }
  ];

  setPageTitle(title: string): void {
    this.currentPageTitle.set(title);
    this.isMobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
  }
}
