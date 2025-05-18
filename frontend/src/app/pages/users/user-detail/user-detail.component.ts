import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TitleCasePipe } from '@angular/common';

@Component({
   selector: 'app-user-detail',
   standalone: true,
   imports: [
      CommonModule,
      MatIconModule,
      TranslatePipe,
      DatePipe,
      TitleCasePipe,
      NgIf,
      NgFor,
   ],
   templateUrl: './user-detail.component.html',
   styleUrls: ['./user-detail.component.css'],
})
export class UserDetailComponent implements OnInit {
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private userService = inject(UserService);
   private notificationService = inject(NotificationService);

   user: User | null = null;
   isLoading = true;
   userId: string | null = null;

   ngOnInit(): void {
      this.userId = this.route.snapshot.paramMap.get('id');
      if (this.userId) {
         this.loadUserDetails(this.userId);
      } else {
         this.notificationService.show('error', 'User ID not provided.');
         this.router.navigate(['/users']);
         this.isLoading = false;
      }
   }

   loadUserDetails(id: string): void {
      this.isLoading = true;
      this.userService.getUserById(id).subscribe({
         next: (userData) => {
            this.user = userData;
            this.isLoading = false;
         },
         error: (err) => {
            this.isLoading = false;
            this.notificationService.show(
               'error',
               `Failed to load user details: ${err.message || 'User not found'}`
            );
            this.router.navigate(['/users']);
         },
      });
   }

   goBack(): void {
      this.router.navigate(['/users']);
   }
}
