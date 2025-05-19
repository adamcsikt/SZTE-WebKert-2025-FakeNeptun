import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { WidgetComponent } from '../../shared/components/widget/widget.component';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { Subscription } from 'rxjs';

interface DashboardItem {
   id: string | number;
   icon?: string;
   [key: string]: any;
}

@Component({
   selector: 'app-dashboard',
   standalone: true,
   imports: [
      CommonModule,
      TranslatePipe,
      WidgetComponent,
      MatListModule,
      MatProgressSpinnerModule,
   ],
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
   private router = inject(Router);
   private notificationService = inject(NotificationService);
   private authService = inject(AuthService);

   currentUser: User | null = null;
   private currentUserSubscription: Subscription | undefined;

   upcomingEvents: DashboardItem[] = [
      { id: 1, name: 'Webkert Project Deadline', date: '2025-05-30' },
      { id: 2, name: 'Summer Break Starts', date: '2025-06-15' },
   ];
   results: DashboardItem[] = [
      {
         id: 1,
         name: 'Personal and Social Skills',
         detail: 'IBNA1005E',
         status: 'Cannot be assessed',
      },
      {
         id: 2,
         name: 'Foundations of Programming (lecture)',
         detail: 'IBNJ1001E',
         status: 'Pass (2)',
      },
      { id: 3, name: 'Web Planning', detail: 'IB714e', status: 'Fail (1)' },
   ];
   messages: DashboardItem[] = [
      {
         id: 1,
         name: 'System message',
         detail: 'Értesítés számla létrehozásáról',
         date: '4 days ago',
         icon: 'person',
         unread: true,
      },
      {
         id: 2,
         name: 'Üzemeltetés Neptun',
         detail: 'Tudd meg Te is, hogyan...',
         date: '4 days ago',
         icon: 'person',
         unread: true,
      },
      {
         id: 3,
         name: 'System message',
         detail: 'Értesítés: BTK Szemináriumok',
         date: '5 days ago',
         icon: 'person',
         unread: false,
      },
   ];
   todoItems: DashboardItem[] = [
      {
         id: 1,
         name: 'BTK - Student evaluation of seminars and...',
         deadline: '25 May 2025',
      },
      {
         id: 2,
         name: 'SZTE - Student evaluation of university...',
         deadline: '25 May 2025',
      },
   ];
   exams: DashboardItem[] = [];
   fulfilledCredits = { current: 5, total: 180 };
   averages = { cci: 0.06 };

   ngOnInit(): void {
      this.currentUserSubscription = this.authService.currentUser$.subscribe(
         (user) => {
            this.currentUser = user;
         }
      );
   }

   ngOnDestroy(): void {
      if (this.currentUserSubscription) {
         this.currentUserSubscription.unsubscribe();
      }
   }

   handleItemClick(item: any, widgetTitleKey: string): void {
      console.log(`Item clicked in ${widgetTitleKey}:`, item);
      this.notificationService.show(
         'info',
         `Clicked on: ${item.name || item.detail}`
      );
   }

   navigateTo(path: string): void {
      this.router.navigate([path]);
   }
}
