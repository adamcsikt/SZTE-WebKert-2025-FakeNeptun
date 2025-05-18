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
import { User, ContactEmail } from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FormValidatorPipe } from '../../shared/pipes/form-validator.pipe';

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
   currentUser: User | null = null;
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
      this.authService.currentUser$.subscribe((user) => {
         if (user) {
            this.currentUser = user;
            this.patchFormWithUserData(user);
         } else {
            this.notificationService.show(
               'error',
               'User data not found. Please log in.'
            );
            this.router.navigate(['/login']);
         }
      });
   }

   patchFormWithUserData(user: User): void {
      let primaryEmail = '';
      if (user.emails && user.emails.length > 0) {
         const defaultEmail = user.emails.find((e) => e.isDefault);
         primaryEmail = defaultEmail
            ? defaultEmail.address
            : user.emails[0].address;
      }

      this.profileForm.patchValue({
         firstName: user.firstName,
         lastName: user.lastName,
         email: primaryEmail,
         nickname: user.nickname,
         profilePicture: user.profilePicture,
      });
   }

   get displayEmail(): string {
      if (
         !this.currentUser ||
         !this.currentUser.emails ||
         this.currentUser.emails.length === 0
      ) {
         return 'N/A';
      }
      const defaultEmail = this.currentUser.emails.find((e) => e.isDefault);
      if (defaultEmail && defaultEmail.address) {
         return defaultEmail.address;
      }
      if (this.currentUser.emails[0] && this.currentUser.emails[0].address) {
         return this.currentUser.emails[0].address;
      }
      return 'N/A';
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

      const updatedEmails: ContactEmail[] = this.currentUser.emails
         ? [...this.currentUser.emails]
         : [];
      let foundDefault = false;

      if (updatedEmails.length > 0) {
         const defaultEmailIndex = updatedEmails.findIndex((e) => e.isDefault);
         if (defaultEmailIndex !== -1) {
            updatedEmails[defaultEmailIndex] = {
               ...updatedEmails[defaultEmailIndex],
               address: formValue.email,
            };
            foundDefault = true;
         } else {
            updatedEmails[0] = {
               ...updatedEmails[0],
               address: formValue.email,
               isDefault: true,
            };
            foundDefault = true;
         }
      }
      if (!foundDefault && formValue.email) {
         updatedEmails.forEach((e) => (e.isDefault = false));
         updatedEmails.unshift({
            address: formValue.email,
            type: 'personal',
            isDefault: true,
         });
      }

      const updatedUserData: Partial<User> = {
         firstName: formValue.firstName,
         lastName: formValue.lastName,
         nickname: formValue.nickname,
         profilePicture: formValue.profilePicture,
         emails: updatedEmails,
      };

      this.userService
         .updateUser(this.currentUser._id, updatedUserData)
         .subscribe({
            next: (updatedUser) => {
               this.isLoading = false;
               this.isEditing = false;
               this.authService.updateCurrentUser(updatedUser);
               this.notificationService.show(
                  'success',
                  'Profile updated successfully!'
               );
            },
            error: (err) => {
               this.isLoading = false;
               this.notificationService.show(
                  'error',
                  'Failed to update profile. ' + (err.message || '')
               );
            },
         });
   }

   onDeleteProfile(): void {
      if (!this.currentUser) return;
      const confirmDelete = confirm(
         'Are you sure you want to delete your profile? This action cannot be undone.'
      );
      if (confirmDelete) {
         this.isLoading = true;
         this.userService.deleteUser(this.currentUser._id).subscribe({
            next: () => {
               this.isLoading = false;
               this.notificationService.show(
                  'success',
                  'Profile deleted successfully.'
               );
               this.authService.clearAuthData();
               this.router.navigate(['/login']);
            },
            error: (err) => {
               this.isLoading = false;
               this.notificationService.show(
                  'error',
                  'Failed to delete profile. ' + (err.message || '')
               );
            },
         });
      }
   }
   get f() {
      return this.profileForm.controls;
   }
}
