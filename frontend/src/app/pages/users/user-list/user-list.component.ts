import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { QueryDocumentSnapshot, DocumentData } from '@angular/fire/firestore';

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

   private firstVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
   private lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;
   private pageCursors: (QueryDocumentSnapshot<DocumentData> | null)[] = [null];

   async ngOnInit(): Promise<void> {
      await this.loadUsers('first');
   }

   async loadUsers(direction: 'first' | 'next' | 'prev'): Promise<void> {
      this.isLoading = true;
      let cursor: QueryDocumentSnapshot<DocumentData> | null = null;

      if (direction === 'next') {
         cursor = this.lastVisibleDoc;
      } else if (direction === 'prev') {
         cursor = this.pageCursors[this.currentPage - 2] || null;
         if (this.currentPage <= 1) direction = 'first';
      }

      try {
         const data = await this.userService.getUsers(
            this.pageSize,
            direction,
            cursor
         );
         this.paginatedUsersData = data;
         this.firstVisibleDoc = data.firstVisible;
         this.lastVisibleDoc = data.lastVisible;

         if (direction === 'first') {
            this.currentPage = 1;
            this.pageCursors = [null, data.lastVisible];
         } else if (direction === 'next') {
            this.currentPage++;
            if (this.pageCursors.length <= this.currentPage) {
               this.pageCursors.push(data.lastVisible);
            } else {
               this.pageCursors[this.currentPage] = data.lastVisible;
            }
         } else if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
         }
         if (this.paginatedUsersData) {
            this.paginatedUsersData.totalPages = Math.ceil(
               this.paginatedUsersData.totalItems / this.pageSize
            );
            this.paginatedUsersData.currentPage = this.currentPage;
         }
      } catch (error: any) {
         this.notificationService.show(
            'error',
            'Failed to load users: ' + (error.message || 'Unknown error')
         );
      } finally {
         this.isLoading = false;
      }
   }

   viewUser(userId: string): void {
      this.router.navigate(['/users', userId]);
   }

   async nextPage(): Promise<void> {
      if (
         this.paginatedUsersData &&
         this.lastVisibleDoc &&
         this.currentPage < this.paginatedUsersData.totalPages
      ) {
         await this.loadUsers('next');
      }
   }

   async prevPage(): Promise<void> {
      if (this.currentPage > 1) {
         await this.loadUsers('prev');
      }
   }

   async goToPage(pageNumber: number): Promise<void> {
      if (
         !this.paginatedUsersData ||
         pageNumber < 1 ||
         pageNumber > this.paginatedUsersData.totalPages
      )
         return;

      console.warn(
         'goToPage directly with Firestore cursors requires more advanced state management of cursors for each page. Resetting to first and then fetching to the page, or implement full cursor list.'
      );
      if (pageNumber === 1) {
         await this.loadUsers('first');
      } else if (pageNumber > this.currentPage) {
         let navigationsNeeded = pageNumber - this.currentPage;
         if (this.currentPage === 1 && this.pageCursors.length <= 1)
            await this.loadUsers('first');
         for (let i = 0; i < navigationsNeeded; i++) {
            if (
               this.paginatedUsersData &&
               this.currentPage < this.paginatedUsersData.totalPages
            ) {
               await this.nextPage();
            } else {
               break;
            }
         }
      } else if (pageNumber < this.currentPage) {
         await this.loadUsers('first');
         for (let i = 1; i < pageNumber; i++) {
            if (
               this.paginatedUsersData &&
               this.currentPage < this.paginatedUsersData.totalPages
            ) {
               await this.nextPage();
            } else {
               break;
            }
         }
      }
      this.currentPage = pageNumber;
      if (this.paginatedUsersData)
         this.paginatedUsersData.currentPage = this.currentPage;
   }

   get pagesArray(): number[] {
      if (!this.paginatedUsersData || !this.paginatedUsersData.totalPages)
         return [];
      const pageCount = Math.min(this.paginatedUsersData.totalPages, 5);
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(
         this.paginatedUsersData.totalPages,
         startPage + pageCount - 1
      );

      const pages: number[] = [];
      for (let i = startPage; i <= endPage; i++) {
         pages.push(i);
      }
      return pages;
   }
}
