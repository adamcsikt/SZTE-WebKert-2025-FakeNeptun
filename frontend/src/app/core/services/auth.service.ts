import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { User as AppUser } from '../models/user.model';
import {
   Auth,
   authState,
   signInWithEmailAndPassword,
   createUserWithEmailAndPassword,
   signOut,
   User as FirebaseUser,
   updateProfile,
   getIdToken,
} from '@angular/fire/auth';
import {
   Firestore,
   doc,
   setDoc,
   getDoc,
   updateDoc,
   deleteDoc,
} from '@angular/fire/firestore';
import { NotificationService } from './notification.service';
import { environment } from '../../../environments/environment';

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private firebaseAuth = inject(Auth);
   private firestore = inject(Firestore);
   private router = inject(Router);
   private notificationService = inject(NotificationService);

   private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
   public currentUser$: Observable<AppUser | null> =
      this.currentUserSubject.asObservable();

   private currentTokenSubject = new BehaviorSubject<string | null>(null);
   public currentToken$: Observable<string | null> =
      this.currentTokenSubject.asObservable();

   constructor() {
      authState(this.firebaseAuth)
         .pipe(
            switchMap((firebaseUser) => {
               if (firebaseUser) {
                  return from(this.fetchAppUser(firebaseUser.uid)).pipe(
                     switchMap((appUser) => {
                        if (appUser) {
                           this.currentUserSubject.next(appUser);
                           localStorage.setItem(
                              'currentUser',
                              JSON.stringify(appUser)
                           );
                           return from(getIdToken(firebaseUser));
                        } else {
                           console.warn(
                              `No user profile found in Firestore for UID: ${firebaseUser.uid}. Forcing sign out.`
                           );
                           return from(signOut(this.firebaseAuth)).pipe(
                              switchMap(() => of(null))
                           );
                        }
                     }),
                     tap((token) => {
                        if (token) {
                           localStorage.setItem('authToken', token);
                           this.currentTokenSubject.next(token);
                           console.log(
                              'AuthService: User authenticated and Firestore profile loaded.'
                           );
                        } else {
                           this.clearAuthData();
                           console.log(
                              'AuthService: User signed out or token fetch failed after auth state change.'
                           );
                        }
                     }),
                     catchError((err) => {
                        console.error(
                           'Error in authState pipeline (fetching app user or token):',
                           err
                        );
                        this.clearAuthData();
                        return of(null);
                     })
                  );
               } else {
                  this.clearAuthData();
                  return of(null);
               }
            })
         )
         .subscribe();
   }

   private clearAuthDataAndNotify() {
      this.clearAuthData();
   }

   public get currentUserValue(): AppUser | null {
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

   async registerUser(
      userData: Partial<AppUser>,
      passwordInPlainText: string
   ): Promise<AppUser> {
      console.log('AuthService registerUser received:', {
         username: userData.username,
         email: userData.email,
         passwordExists: !!passwordInPlainText,
         passwordLength: passwordInPlainText ? passwordInPlainText.length : 0,
      }); //debug
      if (!userData.username || !userData.email || !passwordInPlainText) {
         console.error('AuthService Registration Pre-check failed:', {
            username: userData.username,
            email: userData.email,
            passwordExists: !!passwordInPlainText,
         });
         throw new Error(
            'Username, email, and password are required for registration.'
         );
      }

      const firebaseAuthEmail = `${userData.username}${environment.USERNAME_DOMAIN_SUFFIX}`;

      try {
         const userCredential = await createUserWithEmailAndPassword(
            this.firebaseAuth,
            firebaseAuthEmail,
            passwordInPlainText
         );
         const firebaseUser = userCredential.user;

         await updateProfile(firebaseUser, {
            displayName: `${userData.firstName} ${userData.lastName}`,
         });

         const newUser: AppUser = {
            _id: firebaseUser.uid,
            firebaseAuthEmail: firebaseAuthEmail,
            username: userData.username,
            firstName: userData.firstName!,
            lastName: userData.lastName!,
            email: userData.email!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            training: userData.training || 'N/A',
            startDate:
               userData.startDate || new Date().toISOString().split('T')[0],
            dateOfBirth: userData.dateOfBirth || '1900-01-01',
            countryOfBirth: userData.countryOfBirth || 'N/A',
            placeOfBirth: userData.placeOfBirth || 'N/A',
            citizenship: userData.citizenship || 'N/A',
            gender: userData.gender || 'Other',
            theme: 'system',
            language: 'en',
            addresses: userData.addresses || [],
            phoneNumbers: userData.phoneNumbers || [],
            documents: userData.documents || [],
         };

         await setDoc(doc(this.firestore, 'users', firebaseUser.uid), newUser);

         return newUser;
      } catch (error: any) {
         this.notificationService.show(
            'error',
            `Registration failed: ${error.message}`
         );
         throw error;
      }
   }

   async loginWithUsername(
      username: string,
      passwordInPlainText: string
   ): Promise<void> {
      const firebaseAuthEmail = `${username}${environment.USERNAME_DOMAIN_SUFFIX}`;
      try {
         const userCredential = await signInWithEmailAndPassword(
            this.firebaseAuth,
            firebaseAuthEmail,
            passwordInPlainText
         );
      } catch (error: any) {
         this.notificationService.show(
            'error',
            `Login failed: ${error.message}`
         );
         this.clearAuthData();
         throw error;
      }
   }

   private async fetchAppUser(uid: string): Promise<AppUser | null> {
      const userDocRef = doc(this.firestore, 'users', uid);
      try {
         const userDocSnap = await getDoc(userDocRef);
         if (userDocSnap.exists()) {
            return userDocSnap.data() as AppUser;
         } else {
            console.warn(
               `WorkspaceAppUser: No user profile found in Firestore for UID: ${uid}.`
            );
            return null;
         }
      } catch (error) {
         console.error(
            `WorkspaceAppUser: Error fetching user profile for UID ${uid}:`,
            error
         );
         return null;
      }
   }

   public async handleSuccessfulLogin(
      firebaseUser: FirebaseUser,
      appUser: AppUser
   ): Promise<void> {
      this.currentUserSubject.next(appUser);
      localStorage.setItem('currentUser', JSON.stringify(appUser));
      try {
         const token = await getIdToken(firebaseUser);
         this.currentTokenSubject.next(token);
         localStorage.setItem('authToken', token);
      } catch (error) {
         console.error('Error getting ID token:', error);
         this.clearAuthDataAndNotify();
      }
   }

   public async logout(): Promise<void> {
      try {
         await signOut(this.firebaseAuth);
         this.router.navigate(['/login']);
         this.notificationService.show('success', 'Logged out successfully.');
      } catch (error: any) {
         this.notificationService.show(
            'error',
            `Logout failed: ${error.message}`
         );
         this.clearAuthData();
         this.router.navigate(['/login']);
      }
   }

   public async updateCurrentAppUser(
      updatedUserData: Partial<AppUser>
   ): Promise<void> {
      const currentUser = this.currentUserValue;
      if (!currentUser) {
         this.notificationService.show('error', 'No user logged in to update.');
         return;
      }
      const userDocRef = doc(this.firestore, 'users', currentUser._id);
      try {
         await updateDoc(userDocRef, updatedUserData);
         const newAppUser = { ...currentUser, ...updatedUserData };
         this.currentUserSubject.next(newAppUser);
         localStorage.setItem('currentUser', JSON.stringify(newAppUser));
         this.notificationService.show(
            'success',
            'Profile updated successfully.'
         );
      } catch (error: any) {
         this.notificationService.show(
            'error',
            `Failed to update profile: ${error.message}`
         );
         throw error;
      }
   }

   public async deleteCurrentUserAccount(): Promise<void> {
      const firebaseUser = this.firebaseAuth.currentUser;
      if (!firebaseUser) {
         this.notificationService.show('error', 'No user to delete.');
         return;
      }
      const userId = firebaseUser.uid;
      try {
         await deleteDoc(doc(this.firestore, 'users', userId));
         await firebaseUser.delete();
         this.notificationService.show(
            'success',
            'Account deleted successfully.'
         );
         this.router.navigate(['/register']);
      } catch (error: any) {
         this.notificationService.show(
            'error',
            `Failed to delete account: ${error.message}. Please re-authenticate if prompted.`
         );
         if (error.code === 'auth/requires-recent-login') {
            this.router.navigate(['/login'], {
               queryParams: { reauthReason: 'deleteAccount' },
            });
         }
         throw error;
      }
   }

   public clearAuthData(): void {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      this.currentUserSubject.next(null);
      this.currentTokenSubject.next(null);
      console.log('AuthService: Client-side authentication data cleared.');
   }
}
