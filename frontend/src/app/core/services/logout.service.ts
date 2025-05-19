import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
   providedIn: 'root',
})
export class LogoutService {
   private authService = inject(AuthService);

   constructor() {}

   async logoutUser(): Promise<void> {
      await this.authService.logout();
   }
}
