import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, from } from 'rxjs';

@Injectable({
   providedIn: 'root',
})
export class LoginService {
   private authService = inject(AuthService);

   constructor() {}

   login(username: string, passwordInPlainText: string): Observable<void> {
      return from(
         this.authService.loginWithUsername(username, passwordInPlainText)
      );
   }
}
