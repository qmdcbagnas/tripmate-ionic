import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { environment } from '../environments/environment';

export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);

  if (environment.USE_MOCK_DATA) {
    const stored = localStorage.getItem('tripmate_mock_session');
    if (stored) return router.createUrlTree(['/homepage']);
    return true;
  }

  const supabase = inject(SupabaseService);
  const { data } = await supabase.auth.getSession();
  
  if (data.session) {
    return router.createUrlTree(['/homepage']);
  }
  return true;
};
