import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { User as AppUser } from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FormValidatorPipe } from '../../shared/pipes/form-validator.pipe';
import { take } from 'rxjs';

@Component({
   selector: 'app-profile',
   standalone: true,
   imports: [
      CommonModule,
      ReactiveFormsModule,
      TranslatePipe,
      FormValidatorPipe,
      MatIconModule,
      NgIf,
      RouterLink,
   ],
   templateUrl: './profile.component.html',
   styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
   private authService = inject(AuthService);
   private userService = inject(UserService);
   private fb = inject(FormBuilder);
   private notificationService = inject(NotificationService);
   private router = inject(Router);

   profileForm!: FormGroup;
   currentUser: AppUser | null = null;
   isLoading = false;
   isEditing = false;

   constructor() {
      this.profileForm = this.fb.group({
         firstName: ['', [Validators.required, Validators.minLength(2)]],
         lastName: ['', [Validators.required, Validators.minLength(2)]],
         email: ['', [Validators.required, Validators.email]],
         nickname: [''],
         profilePicture: [''],
      });
   }

   ngOnInit(): void {
      this.authService.currentUser$.pipe(take(1)).subscribe((user) => {
         if (user) {
            this.currentUser = user;
            this.patchFormWithUserData(user);
         } else {
            if (this.router.url.includes('/profile')) {
               console.log(
                  'ProfileComponent: currentUser is null. AuthGuard should redirect.'
               );
            }
         }
      });
   }

   patchFormWithUserData(user: AppUser): void {
      this.profileForm.patchValue({
         firstName: user.firstName,
         lastName: user.lastName,
         email: user.email,
         nickname: user.nickname,
         profilePicture: user.profilePicture,
      });
   }

   get displayEmail(): string {
      return this.currentUser?.email || 'N/A';
   }

   toggleEdit(): void {
      this.isEditing = !this.isEditing;
      if (this.isEditing && this.currentUser) {
         this.patchFormWithUserData(this.currentUser);
      }
   }

   onSubmit(): void {
      if (!this.currentUser) {
         this.notificationService.show(
            'error',
            'Cannot save profile: User not loaded.'
         );
         return;
      }
      if (this.profileForm.invalid) {
         this.notificationService.show(
            'error',
            'Please correct the form errors.'
         );
         this.profileForm.markAllAsTouched();
         return;
      }

      this.isLoading = true;
      const formValue = this.profileForm.value;

      const updatedUserData: Partial<AppUser> = {
         firstName: formValue.firstName,
         lastName: formValue.lastName,
         nickname: formValue.nickname || '',
         profilePicture: formValue.profilePicture || '',
         email: formValue.email,
      };

      this.authService
         .updateCurrentAppUser(updatedUserData)
         .then(() => {
            this.isLoading = false;
            this.isEditing = false;
            if (this.currentUser) {
               this.currentUser = { ...this.currentUser, ...updatedUserData };
            }
         })
         .catch((err: any) => {
            this.isLoading = false;
            console.error('Profile update failed in component:', err);
         });
   }

   onDeleteProfile(): void {
      if (!this.currentUser) return;
      const confirmDelete = confirm(
         'Are you sure you want to delete your profile? This action cannot be undone.'
      );
      if (confirmDelete) {
         this.isLoading = true;
         this.authService
            .deleteCurrentUserAccount()
            .then(() => {
               this.isLoading = false;
            })
            .catch((err: any) => {
               this.isLoading = false;
               console.error('Profile deletion failed in component:', err);
            });
      }
   }

   get f() {
      return this.profileForm.controls;
   }
}
