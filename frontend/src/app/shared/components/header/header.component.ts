import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

import { User } from '../../../core/models/user.model';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-header',
   imports: [RouterLink],
   templateUrl: './header.component.html',
   styleUrl: './header.component.css',
})
export class HeaderComponent {
   private authService = inject(AuthService);
   currentUser$: Observable<User | null> = this.authService.currentUser$;

   private notificationService = inject(NotificationService);

   logout(): void {
      console.log('HeaderComponent: Logout button clicked.');
      this.authService.logout();
      this.notificationService.show('success', 'Logged out successfully.');
   }
}
