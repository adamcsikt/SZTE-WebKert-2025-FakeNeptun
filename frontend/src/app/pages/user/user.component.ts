import { Component, OnInit, inject, OnDestroy } from '@angular/core';
// Removed NgFor as MatTable handles its own iteration. Keep CommonModule for NgIf.
import { CommonModule, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // RouterLink is not used in template
import { Subscription } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { I18nService } from '../../core/services/i18n.service';

@Component({
   selector: 'app-user',
   standalone: true,
   imports: [
      CommonModule,
      NgIf, // NgFor removed
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatButtonModule,
      MatIconModule,
      MatProgressSpinnerModule,
      MatCardModule,
      MatDialogModule,
      MatSnackBarModule,
      TranslatePipe,
      // ConfirmationDialogComponent removed from imports here, it's opened via service
   ],
   templateUrl: './user.component.html',
   styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
   users: User[] = [];
   isLoading = true;
   displayedColumns: string[] = [
      'username',
      'firstName',
      'lastName',
      'email',
      'actions',
   ];

   userIdFromRoute: string | null = null;
   // specificUser: User | null = null; // Not used currently

   private userService = inject(UserService);
   public authService = inject(AuthService);
   private notificationService = inject(NotificationService);
   private router = inject(Router);
   private route = inject(ActivatedRoute);
   public dialog = inject(MatDialog); // Keep public for template if any part needs it, or make private
   private i18nService = inject(I18nService);

   private subscriptions = new Subscription();

   ngOnInit(): void {
      this.subscriptions.add(
         this.route.paramMap.subscribe((params) => {
            this.userIdFromRoute = params.get('id');
            if (this.userIdFromRoute) {
               this.router.navigate(['/profile'], {
                  queryParams: { userIdForAdminView: this.userIdFromRoute },
               });
            } else {
               this.loadAllUsers();
            }
         })
      );
   }

   loadAllUsers(): void {
      this.isLoading = true;
      this.subscriptions.add(
         this.userService.getAllUsers().subscribe({
            next: (data) => {
               this.users = data;
               this.isLoading = false;
            },
            error: (err) => {
               this.notificationService.show(
                  'error',
                  'Failed to load users: ' + (err.message || err)
               );
               this.isLoading = false;
            },
         })
      );
   }

   editUser(userId: string): void {
      this.router.navigate(['/profile'], {
         queryParams: { userIdForAdminEdit: userId },
      });
   }

   deleteUser(userId: string, userName: string): void {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
         // This component needs to be known to Angular (e.g. imported in AppModule or as standalone)
         width: '400px',
         data: {
            title: this.i18nService.translate('CONFIRM_DELETE_USER_TITLE'),
            message: `${this.i18nService.translate(
               'CONFIRM_DELETE_USER_MESSAGE'
            )} <b>${userName}</b> (ID: ${userId})?`,
            confirmButtonText: this.i18nService.translate('DELETE_BUTTON'),
            cancelButtonText: this.i18nService.translate('CANCEL_BUTTON'),
         },
      });

      this.subscriptions.add(
         dialogRef.afterClosed().subscribe((result) => {
            if (result) {
               this.isLoading = true;
               this.subscriptions.add(
                  this.userService.deleteUser(userId).subscribe({
                     next: () => {
                        this.notificationService.show(
                           'success',
                           `User ${userName} deleted successfully.`
                        );
                        this.loadAllUsers();
                        this.isLoading = false;
                     },
                     error: (err) => {
                        this.notificationService.show(
                           'error',
                           `Failed to delete user ${userName}: ` +
                              (err.message || err)
                        );
                        this.isLoading = false;
                     },
                  })
               );
            }
         })
      );
   }

   ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
   }
}
