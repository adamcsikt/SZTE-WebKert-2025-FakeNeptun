import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface PaginatedUsers {
   users: User[];
   totalItems: number;
   currentPage: number;
   pageSize: number;
   totalPages: number;
}

@Injectable({
   providedIn: 'root',
})
export class UserService {
   private apiUrl = `${environment.apiURL}/users`;
   private http = inject(HttpClient);
   private authService = inject(AuthService);
   private notificationService = inject(NotificationService);

   private getAuthHeaders(): HttpHeaders {
      const token = this.authService.currentTokenValue;
      if (!token) {
         this.notificationService.show(
            'error',
            'Authentication token not found. Please log in again.'
         );
         return new HttpHeaders();
      }
      return new HttpHeaders({
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      });
   }

   getUsers(page: number = 1, limit: number = 20): Observable<PaginatedUsers> {
      return this.http
         .get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() })
         .pipe(
            map((users) => {
               const totalItems = users.length;
               const totalPages = Math.ceil(totalItems / limit);
               const startIndex = (page - 1) * limit;
               const endIndex = Math.min(
                  startIndex + limit - 1,
                  totalItems - 1
               );
               const paginatedUsers = users.slice(startIndex, endIndex + 1);

               return {
                  users: paginatedUsers,
                  totalItems,
                  currentPage: page,
                  pageSize: limit,
                  totalPages,
               };
            }),
            catchError(this.handleError.bind(this))
         );
   }

   getUserById(id: string): Observable<User> {
      return this.http
         .get<User>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
         .pipe(catchError(this.handleError.bind(this)));
   }

   updateUser(id: string, userData: Partial<User>): Observable<User> {
      return this.http
         .put<{ user: User; message: string }>(
            `${this.apiUrl}/${id}`,
            userData,
            { headers: this.getAuthHeaders() }
         )
         .pipe(
            map((response) => response.user),
            catchError(this.handleError.bind(this))
         );
   }

   deleteUser(id: string): Observable<any> {
      return this.http
         .delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
         .pipe(catchError(this.handleError.bind(this)));
   }

   private handleError(error: any): Observable<never> {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
         errorMessage = `Error: ${error.error.message}`;
      } else {
         errorMessage = `Error Code: ${error.status}\nMessage: ${
            error.message || error.error?.message
         }`;
      }
      console.error(errorMessage);
      if (this.notificationService) {
         this.notificationService.show('error', errorMessage);
      } else {
         console.error('NotificationService not available in handleError');
      }
      return throwError(() => new Error(errorMessage));
   }
}
