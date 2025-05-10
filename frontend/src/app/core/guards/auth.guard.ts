import {
   CanActivateFn,
   Router,
   ActivatedRouteSnapshot,
   RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
   route: ActivatedRouteSnapshot,
   state: RouterStateSnapshot
): boolean | Observable<boolean> | Promise<boolean> => {
   const authService = inject(AuthService);
   const router = inject(Router);

   const isAuthenticated = authService.isAuthenticated();

   console.log(
      `AuthGuard: Checking route: ${state.url}. IsAuthenticated: ${isAuthenticated}`
   );

   if (!isAuthenticated) {
      console.log('AuthGuard: User not authenticated. Redirecting to /login');
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
   }

   return true;
};
