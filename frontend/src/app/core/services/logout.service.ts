import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Import 'of' for potential mock backend call
import { tap, catchError } from 'rxjs/operators';
import { environment as env } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service'; // AuthService will still manage state

@Injectable({
   providedIn: 'root',
})
export class LogoutService {
   private http = inject(HttpClient);
   private router = inject(Router);
   private notificationService = inject(NotificationService);
   private authService = inject(AuthService); // To call its state-clearing methods

   private apiUrl = `${env.apiURL}/logout`; // If you have a backend logout endpoint

   constructor() {}

   // Option 1: Logout involves a backend call
   logoutUser(): Observable<any> {
      // Example: if you have a backend endpoint to invalidate session/token
      return this.http.post(this.apiUrl, {}).pipe(
         tap(() =>
            this.handleClientSideLogout('Logged out successfully from server.')
         ),
         catchError((error) => {
            console.error(
               'Backend logout failed, proceeding with client-side logout:',
               error
            );
            this.handleClientSideLogout('Logout processed (client-side).');
            return of({}); // Still proceed with client logout
         })
      );
   }

   // Option 2: Logout is purely client-side (if you decide against a backend call or it's simple)
   // In this case, you might not even need a separate service and could call authService.clearAuthData() directly
   // But to keep it in this service as requested:
   performClientSideLogout(message: string = 'Logged out successfully.'): void {
      this.handleClientSideLogout(message);
   }

   private handleClientSideLogout(notificationMessage: string): void {
      this.authService.clearAuthData(); // New method in AuthService to clear state
      this.notificationService.show('success', notificationMessage);
      this.router.navigate(['/login']);
   }
}
