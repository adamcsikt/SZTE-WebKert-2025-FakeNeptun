import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import {
   Firestore,
   collection,
   addDoc,
   serverTimestamp,
} from '@angular/fire/firestore';

export interface Feedback {
   _id?: string;
   createdAt?: any;
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
   private firestore = inject(Firestore);
   private notificationService = inject(NotificationService);
   private authService = inject(AuthService);
   private feedbacksCollection = collection(this.firestore, 'feedbacks');

   constructor() {}

   sendFeedback(
      feedbackData: Omit<Feedback, '_id' | 'createdAt'>
   ): Observable<any> {
      const currentUser = this.authService.currentUserValue;
      const payload: any = { ...feedbackData };

      if (currentUser) {
         payload.userId = currentUser._id;
         payload.username = currentUser.username;
         if (!payload.email && currentUser.email) {
            payload.email = currentUser.email;
         }
      }
      payload.pageUrl = window.location.href;
      payload.createdAt = serverTimestamp();

      return from(addDoc(this.feedbacksCollection, payload)).pipe(
         tap((docRef) => {
            this.notificationService.show(
               'success',
               'Thank you for your feedback!'
            );
            console.log('Feedback submitted with ID: ', docRef.id);
         }),
         catchError(this.handleError.bind(this))
      );
   }

   private handleError(error: any): Observable<never> {
      let errorMessage = 'Could not send feedback.';
      console.error('Feedback service error:', error);
      this.notificationService.show('error', errorMessage);
      return throwError(() => new Error(errorMessage));
   }
}
