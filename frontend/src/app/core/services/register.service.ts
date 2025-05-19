import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { User as AppUser } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
   providedIn: 'root',
})
export class RegisterService {
   private authService = inject(AuthService);

   constructor() {}

   register(
      userData: Partial<AppUser>,
      passwordInPlainText: string
   ): Observable<AppUser> {
      return from(this.authService.registerUser(userData, passwordInPlainText));
   }
}
