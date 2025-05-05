import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust path if needed

export const loginGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
   const router = inject(Router);

   if (!authService.isAuthenticated()) {
      console.log(
         'LoginGuard: User is not logged in. Allowing access to /login.'
      );
      return true;
   }

   console.warn(
      'LoginGuard: User is already logged in. Redirecting to /dashboard...'
   );
   router.navigate(['/dashboard']);
   return false;
};
