import { Component, inject, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { LogoutService } from '../../../core/services/logout.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

import { User } from '../../../core/models/user.model';
import { RouterLink } from '@angular/router';

import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
   selector: 'app-header',
   imports: [RouterLink, NgIf, TranslatePipe, NavMenuComponent],
   templateUrl: './header.component.html',
   styleUrl: './header.component.css',
})
export class HeaderComponent {
   private authService = inject(AuthService);
   currentUser$: Observable<User | null> = this.authService.currentUser$;

   private notificationService = inject(NotificationService);
   private logoutService = inject(LogoutService);

   @Input() visible!: boolean;

   logout(): void {
      console.log('HeaderComponent: Logout button clicked.');
      this.logoutService.logoutUser().subscribe();
      this.notificationService.show('success', 'Logged out successfully.');
   }
}
