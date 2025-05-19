import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import {
   Firestore,
   collection,
   doc,
   getDoc,
   getDocs,
   updateDoc,
   deleteDoc,
   query,
   limit,
   startAfter,
   orderBy,
   getCountFromServer,
   DocumentData,
   QueryDocumentSnapshot,
} from '@angular/fire/firestore';

export interface PaginatedUsers {
   users: User[];
   totalItems: number;
   currentPage: number;
   pageSize: number;
   totalPages: number;
   firstVisible: QueryDocumentSnapshot<DocumentData> | null;
   lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

@Injectable({
   providedIn: 'root',
})
export class UserService {
   private firestore = inject(Firestore);
   private authService = inject(AuthService);
   private notificationService = inject(NotificationService);
   private usersCollection = collection(this.firestore, 'users');

   async getUsers(
      pageSize: number = 20,
      pageDirection: 'next' | 'prev' | 'first' = 'first',
      pageCursor: QueryDocumentSnapshot<DocumentData> | null = null
   ): Promise<PaginatedUsers> {
      if (!this.authService.isAuthenticated()) {
         this.notificationService.show(
            'error',
            'You must be logged in to view users.'
         );
         throw new Error('User not authenticated');
      }

      const usersCollRef = collection(this.firestore, 'users');
      let q;

      if (pageDirection === 'first') {
         q = query(usersCollRef, orderBy('username'), limit(pageSize));
      } else if (pageDirection === 'next' && pageCursor) {
         q = query(
            usersCollRef,
            orderBy('username'),
            startAfter(pageCursor),
            limit(pageSize)
         );
      } else if (pageDirection === 'prev' && pageCursor) {
         console.warn(
            'Previous page with cursor is complex with Firestore general field ordering. Re-fetching first page or implement advanced cursor logic.'
         );
         q = query(usersCollRef, orderBy('username'), limit(pageSize));
      } else {
         q = query(usersCollRef, orderBy('username'), limit(pageSize));
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((docSnap) => docSnap.data() as User);

      const totalItemsSnapshot = await getCountFromServer(usersCollRef);
      const totalItems = totalItemsSnapshot.data().count;
      const totalPages = Math.ceil(totalItems / pageSize);

      return {
         users,
         totalItems,
         currentPage: 1,
         pageSize,
         totalPages,
         firstVisible: querySnapshot.docs[0] || null,
         lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      };
   }

   getUserById(id: string): Observable<User | null> {
      if (!this.authService.isAuthenticated())
         return throwError(() => new Error('Not authenticated'));
      const userDocRef = doc(this.firestore, 'users', id);
      return from(getDoc(userDocRef)).pipe(
         map((docSnap) => {
            if (docSnap.exists()) {
               return docSnap.data() as User;
            } else {
               this.notificationService.show('error', 'User not found.');
               return null;
            }
         }),
         catchError(this.handleError.bind(this))
      );
   }

   async adminUpdateUser(
      userId: string,
      userData: Partial<User>
   ): Promise<User> {
      if (!this.authService.isAuthenticated()) {
         this.notificationService.show('error', 'Unauthorized.');
         throw new Error('Unauthorized');
      }
      const userDocRef = doc(this.firestore, 'users', userId);
      await updateDoc(userDocRef, userData);
      const updatedUserDoc = await getDoc(userDocRef);
      if (!updatedUserDoc.exists())
         throw new Error('User disappeared after update');
      return updatedUserDoc.data() as User;
   }

   async adminDeleteUser(userId: string): Promise<void> {
      if (!this.authService.isAuthenticated()) {
         this.notificationService.show('error', 'Unauthorized.');
         throw new Error('Unauthorized');
      }
      const userDocRef = doc(this.firestore, 'users', userId);
      await deleteDoc(userDocRef);
      this.notificationService.show(
         'success',
         `User data for ${userId} deleted from Firestore.`
      );
   }

   private handleError(error: any): Observable<never> {
      let errorMessage = 'An unknown error occurred with User Service!';
      if (error.message) {
         errorMessage = error.message;
      } else if (error.error instanceof ErrorEvent) {
         errorMessage = `Client-side error: ${error.error.message}`;
      } else if (error.status) {
         errorMessage = `Server-side error: ${error.status} ${error.message}`;
      }
      console.error('UserService Error:', error);
      this.notificationService.show('error', errorMessage);
      return throwError(() => new Error(errorMessage));
   }
}
