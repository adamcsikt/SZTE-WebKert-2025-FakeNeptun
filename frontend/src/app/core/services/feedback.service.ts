import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

export interface Feedback {
   _id?: string;
   createdAt?: string;
   userId?: string;
   username?: string;
   email?: string;
   feedbackType: 'bug' | 'suggestion' | 'compliment' | 'other';
   message: string;
   rating?: number;
   pageUrl?: string;
}

@Injectable({
   providedIn: 'root',
})
export class FeedbackService {
   private apiUrl = `${environment.apiURL}/feedback`;
   private http = inject(HttpClient);
   private notificationService = inject(NotificationService);
   private authService = inject(AuthService);

   constructor() {}

   sendFeedback(
      feedbackData: Omit<Feedback, '_id' | 'createdAt'>
   ): Observable<any> {
      const currentUser = this.authService.currentUserValue;
      const payload: any = { ...feedbackData };

      if (currentUser) {
         payload.userId = currentUser._id;
         payload.username = currentUser.username;
         if (
            !payload.email &&
            currentUser.emails &&
            currentUser.emails.length > 0
         ) {
            const defaultEmail = currentUser.emails.find((e) => e.isDefault);
            payload.email = defaultEmail
               ? defaultEmail.address
               : currentUser.emails[0].address;
         }
      }
      payload.pageUrl = window.location.href;

      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      return this.http.post(this.apiUrl, payload, { headers }).pipe(
         tap((response: any) => {
            this.notificationService.show(
               'success',
               response.message || 'Thank you for your feedback!'
            );
         }),
         catchError(this.handleError.bind(this))
      );
   }

   private handleError(error: any): Observable<never> {
      let errorMessage = 'Could not send feedback.';
      if (error.error instanceof ErrorEvent) {
         errorMessage = `Error: ${error.error.message}`;
      } else if (error.status) {
         errorMessage = `Error Code: ${error.status}\nMessage: ${
            error.message || error.error?.message || 'Server error'
         }`;
      }
      console.error('Feedback service error:', error);
      this.notificationService.show('error', errorMessage);
      return throwError(() => new Error(errorMessage));
   }
}
