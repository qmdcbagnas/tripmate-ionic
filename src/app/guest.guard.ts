import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.currentUser$.pipe(
    filter(user => user !== 'loading'),
    take(1),
    map(user => {
      if (user) {
        return router.createUrlTree(['/homepage']);
      }
      return true;
    })
  );
};

