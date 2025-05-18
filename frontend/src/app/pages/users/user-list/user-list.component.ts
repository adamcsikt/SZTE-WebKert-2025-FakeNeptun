import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import {
   UserService,
   PaginatedUsers,
} from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
   selector: 'app-user-list',
   standalone: true,
   imports: [CommonModule, MatIconModule, TranslatePipe, NgIf, NgFor],
   templateUrl: './user-list.component.html',
   styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
   private userService = inject(UserService);
   private notificationService = inject(NotificationService);
   private router = inject(Router);

   paginatedUsersData: PaginatedUsers | null = null;
   isLoading = true;
   currentPage = 1;
   pageSize = 20;

   ngOnInit(): void {
      this.loadUsers(this.currentPage);
   }

   loadUsers(page: number): void {
      this.isLoading = true;
      this.currentPage = page;
      this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
         next: (data) => {
            this.paginatedUsersData = data;
            this.isLoading = false;
         },
         error: (err) => {
            this.isLoading = false;
            this.notificationService.show(
               'error',
               'Failed to load users: ' + (err.message || 'Unknown error')
            );
         },
      });
   }

   viewUser(userId: string): void {
      this.router.navigate(['/users', userId]);
   }

   nextPage(): void {
      if (
         this.paginatedUsersData &&
         this.currentPage < this.paginatedUsersData.totalPages
      ) {
         this.loadUsers(this.currentPage + 1);
      }
   }

   prevPage(): void {
      if (this.currentPage > 1) {
         this.loadUsers(this.currentPage - 1);
      }
   }

   goToPage(pageNumber: number): void {
      if (
         this.paginatedUsersData &&
         pageNumber >= 1 &&
         pageNumber <= this.paginatedUsersData.totalPages
      ) {
         this.loadUsers(pageNumber);
      }
   }

   get pagesArray(): number[] {
      if (!this.paginatedUsersData) return [];
      return Array(this.paginatedUsersData.totalPages)
         .fill(0)
         .map((x, i) => i + 1);
   }
}
