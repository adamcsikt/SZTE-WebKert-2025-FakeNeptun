import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const loginGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
   const router = inject(Router);

   return authService.currentUser$.pipe(
      take(1),
      map((user) => !user),
      tap((notAuthenticated) => {
         if (!notAuthenticated) {
            console.warn(
               'LoginGuard: User is already logged in. Redirecting to /dashboard...'
            );
            router.navigate(['/dashboard']);
         } else {
            console.log(
               'LoginGuard: User is not logged in. Allowing access to login/register.'
            );
         }
      })
   );
};
