import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment as env } from '../../../environments/environment';

import { User } from '../models/user.model';

interface LoginResponse {
   user: User;
   token: string;
}

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private router = inject(Router);

   private currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromLocalStorage()
   );
   public currentUser$: Observable<User | null> =
      this.currentUserSubject.asObservable();

   private currentTokenSubject = new BehaviorSubject<string | null>(
      this.getTokenFromLocalStorage()
   );
   public currentToken$: Observable<string | null> =
      this.currentTokenSubject.asObservable();

   constructor() {
      console.log(
         'AuthService Initialized. User:',
         this.currentUserSubject.value
      );
      console.log(
         'AuthService Initialized. Token:',
         this.currentTokenSubject.value
      );
   }

   public get currentUserValue(): User | null {
      return this.currentUserSubject.value;
   }

   public get currentTokenValue(): string | null {
      return this.currentTokenSubject.value;
   }

   public isAuthenticated(): boolean {
      return (
         !!this.currentUserSubject.value && !!this.currentTokenSubject.value
      );
   }

   public handleSuccessfulLogin(token: string, user: User): void {
      if (!token || !user) {
         console.error(
            'AuthService: handleSuccessfulLogin called with invalid token or user',
            { token, user }
         );

         this.logout();
         return;
      }

      console.log('AuthService: Handling successful login. Updating state...');
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      this.currentUserSubject.next(user);
      console.log('AuthService state updated. New user available.');

      this.currentTokenSubject.next(token);
      console.log('AuthService state updated. Token stored.');
   }

   logout(): void {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');

      this.currentUserSubject.next(null);
      this.currentTokenSubject.next(null);

      console.log('User logged out.');

      this.router.navigate(['/login']);
   }

   private getUserFromLocalStorage(): User | null {
      try {
         const user = localStorage.getItem('currentUser');
         return user ? JSON.parse(user) : null;
      } catch (e) {
         console.error('Error reading user from localStorage', e);
         localStorage.removeItem('currentUser');
         return null;
      }
   }

   private getTokenFromLocalStorage(): string | null {
      const token = localStorage.getItem('authToken');
      return localStorage.getItem('authToken') ?? null;
   }
}
