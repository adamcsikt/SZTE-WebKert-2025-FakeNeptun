import { inject } from '@angular/core';
import {
   CanActivateFn,
   Router,
   ActivatedRouteSnapshot,
   RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (
   route: ActivatedRouteSnapshot,
   state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
   const authService = inject(AuthService);
   const router = inject(Router);

   return authService.currentUser$.pipe(
      take(1),
      map((user) => !!user),
      tap((isAuthenticated) => {
         console.log(
            `AuthGuard: Checking route: ${state.url}. IsAuthenticated: ${isAuthenticated}`
         );
         if (!isAuthenticated) {
            console.log(
               'AuthGuard: User not authenticated. Redirecting to /login'
            );
            router.navigate(['/login'], {
               queryParams: { returnUrl: state.url },
            });
         }
      })
   );
};
