import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ResumeApiService } from '../../core/services/resume-api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ResumeApiService);
  private authService = inject(AuthService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isProfileLoading = signal(false);
  isPasswordLoading = signal(false);

  profileSuccess = signal<string | null>(null);
  profileError = signal<string | null>(null);

  passwordSuccess = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  loadUserProfile(): void {
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          email: profile.email
        });
      }
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isProfileLoading.set(true);
    this.profileSuccess.set(null);
    this.profileError.set(null);

    this.apiService.updateProfile(this.profileForm.value).subscribe({
      next: (updated) => {
        this.profileSuccess.set('Profile updated successfully!');
        this.isProfileLoading.set(false);

        // Update the cached user signal state locally
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          const freshUser = { ...currentUser, fullName: updated.fullName, email: updated.email };
          localStorage.setItem('user', JSON.stringify(freshUser));
          this.authService.currentUser.set(freshUser);
        }
      },
      error: (err) => {
        this.profileError.set(err || 'Failed to update profile info.');
        this.isProfileLoading.set(false);
      }
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isPasswordLoading.set(true);
    this.passwordSuccess.set(null);
    this.passwordError.set(null);

    this.apiService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.passwordSuccess.set('Password changed successfully!');
        this.isPasswordLoading.set(false);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordError.set(err || 'Failed to update password. Verify current password is correct.');
        this.isPasswordLoading.set(false);
      }
    });
  }
}
