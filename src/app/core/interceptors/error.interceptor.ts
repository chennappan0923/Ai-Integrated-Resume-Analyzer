import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if ([401, 403].includes(err.status)) {
        // Auto logout if 401 or 403 response returned from API
        authService.logout();
      }

      const error = err.error?.message || err.statusText || 'An error occurred';
      return throwError(() => error);
    })
  );
};
