import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {
   FormBuilder,
   FormGroup,
   Validators,
   ReactiveFormsModule,
   FormArray,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import {
   User,
   ContactEmail,
   ContactAddress,
   ContactPhoneNumber,
   Website,
   BankAccount,
   UserPreferences,
} from '../../core/models/user.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FormValidatorPipe } from '../../shared/pipes/form-validator.pipe';
import { EmailFormSectionComponent } from '../../shared/components/profile-sections/email-form-section/email-form-section.component';

@Component({
   selector: 'app-profile',
   standalone: true,
   imports: [
      CommonModule,
      NgIf,
      ReactiveFormsModule,
      TranslatePipe,
      FormValidatorPipe,
      EmailFormSectionComponent,
   ],
   templateUrl: './profile.component.html',
   styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
   profileForm!: FormGroup;
   currentUser: User | null = null;
   isLoading = false;
   isEditingOtherUser = false;
   private subscriptions = new Subscription();

   private fb = inject(FormBuilder);
   public authService = inject(AuthService);
   private userService = inject(UserService);
   private notificationService = inject(NotificationService);
   private route = inject(ActivatedRoute);
   private router = inject(Router);

   themes = [
      { value: 'light', viewValueKey: 'THEME_LIGHT' },
      { value: 'dark', viewValueKey: 'THEME_DARK' },
      { value: 'system', viewValueKey: 'THEME_SYSTEM' },
   ];
   languages = [
      { value: 'en', viewValueKey: 'LANGUAGE_EN' },
      { value: 'hu', viewValueKey: 'LANGUAGE_HU' },
   ];
   addressTypes = [
      { value: 'permanent', viewValueKey: 'PERMANENT_LABEL' },
      { value: 'temporary', viewValueKey: 'TEMPORARY_LABEL' },
   ];
   websiteTypes = [
      { value: 'personal', viewValueKey: 'PERSONAL_LABEL' },
      { value: 'university', viewValueKey: 'UNIVERSITY_LABEL' },
      { value: 'other', viewValueKey: 'OTHER_LABEL' },
   ];
   bankAccountTypes = [
      { value: 'domestic', viewValueKey: 'DOMESTIC_LABEL' },
      { value: 'international', viewValueKey: 'INTERNATIONAL_LABEL' },
   ];

   constructor() {}

   ngOnInit(): void {
      this.initForm();
      this.subscriptions.add(
         this.route.queryParams.subscribe((params) => {
            const userIdToView =
               params['userIdForAdminView'] || params['userIdForAdminEdit'];
            if (userIdToView) {
               this.isEditingOtherUser = !!params['userIdForAdminEdit']; // True if editing, false if just viewing
               this.loadUserProfile(userIdToView);
            } else {
               this.isEditingOtherUser = false;
               this.subscriptions.add(
                  this.authService.currentUser$.subscribe(
                     (user: User | null) => {
                        this.handleCurrentUserUpdate(user);
                     }
                  )
               );
            }
         })
      );
   }

   handleCurrentUserUpdate(user: User | null): void {
      if (user) {
         this.currentUser = { ...user };
         if (!this.currentUser.preferences) {
            this.currentUser.preferences = {
               receiveNotifications: true,
               preferredContactMethod: 'email',
            };
         }
         this.populateForm(this.currentUser);
      } else {
         this.currentUser = null;
         this.profileForm.reset();
      }
   }

   loadUserProfile(userId: string): void {
      this.isLoading = true;
      this.subscriptions.add(
         this.userService.getUserById(userId).subscribe({
            next: (user) => {
               this.currentUser = { ...user };
               if (!this.currentUser.preferences) {
                  this.currentUser.preferences = {
                     receiveNotifications: true,
                     preferredContactMethod: 'email',
                  };
               }
               this.populateForm(this.currentUser);
               this.isLoading = false;
            },
            error: (err: any) => {
               this.notificationService.show(
                  'error',
                  `Failed to load user profile: ${err.message || err}`
               );
               this.isLoading = false;
               this.currentUser = null;
               this.router.navigate(['/users']);
            },
         })
      );
   }

   initForm(): void {
      this.profileForm = this.fb.group({
         firstName: [{ value: '', disabled: true }, Validators.required],
         lastName: [{ value: '', disabled: true }, Validators.required],
         username: [{ value: '', disabled: true }, Validators.required],
         nickname: [''],
         profilePicture: [''],
         theme: ['system'],
         language: ['en'],
         emails: this.fb.array([]),
         phoneNumbers: this.fb.array([]),
         addresses: this.fb.array([]),
         websites: this.fb.array([]),
         bankAccounts: this.fb.array([]),
         userSettings: this.fb.group({
            receiveNotifications: [true],
            preferredContactMethod: ['email'],
         }),
      });
   }

   populateForm(user: User): void {
      const formDisabled =
         this.isEditingOtherUser && !this.canAdminEditCertainFields(); // Logic for admin edit restrictions

      this.profileForm.patchValue({
         firstName: user.firstName,
         lastName: user.lastName,
         username: user.username,
         nickname: user.nickname || '',
         profilePicture: user.profilePicture || '',
         theme: user.theme || 'system',
         language: user.language || 'en',
         userSettings: {
            receiveNotifications:
               user.preferences?.receiveNotifications !== undefined
                  ? user.preferences.receiveNotifications
                  : true,
            preferredContactMethod:
               user.preferences?.preferredContactMethod || 'email',
         },
      });

      // Always disable these for now
      this.profileForm.get('firstName')?.disable();
      this.profileForm.get('lastName')?.disable();
      this.profileForm.get('username')?.disable();

      if (formDisabled) {
         // Example: disable more fields if admin is viewing/has limited edit
         this.profileForm.get('nickname')?.disable();
         // etc.
      }

      this.setFormArrayData('emails', user.emails || [], (item) =>
         this.createEmailFormGroup(item)
      );
      this.setFormArrayData('phoneNumbers', user.phoneNumbers || [], (item) =>
         this.createPhoneNumberFormGroup(item)
      );
      this.setFormArrayData('addresses', user.addresses || [], (item) =>
         this.createAddressFormGroup(item)
      );
      this.setFormArrayData('websites', user.websites || [], (item) =>
         this.createWebsiteFormGroup(item)
      );
      this.setFormArrayData('bankAccounts', user.bankAccounts || [], (item) =>
         this.createBankAccountFormGroup(item)
      );
   }

   canAdminEditCertainFields(): boolean {
      // Placeholder for logic determining if an admin can edit specific fields of another user
      // For now, let's say admin can edit most things except core identity fields already disabled.
      return true; // Or based on actual admin roles
   }

   private setFormArrayData(
      arrayName: string,
      data: any[] | undefined,
      createGroupFn: (item?: any) => FormGroup
   ): void {
      const formArray = this.profileForm.get(arrayName) as FormArray;
      formArray.clear();
      if (data) {
         data.forEach((item) => formArray.push(createGroupFn(item)));
      }
   }

   // Email (delegated to sub-component but create/remove logic remains here for the FormArray)
   createEmailFormGroup(email?: ContactEmail): FormGroup {
      return this.fb.group({
         address: [
            email?.address || '',
            [Validators.required, Validators.email],
         ],
         type: [email?.type || 'personal', Validators.required],
         isDefault: [email?.isDefault || false],
      });
   }
   addEmailToForm(): void {
      (this.profileForm.get('emails') as FormArray).push(
         this.createEmailFormGroup()
      );
   }
   removeEmailFromForm(index: number): void {
      (this.profileForm.get('emails') as FormArray).removeAt(index);
   }

   // PhoneNumbers
   get phoneNumbersArray(): FormArray {
      return this.profileForm.get('phoneNumbers') as FormArray;
   }
   createPhoneNumberFormGroup(phone?: ContactPhoneNumber): FormGroup {
      return this.fb.group({
         number: [
            phone?.number ? String(phone.number) : '',
            [Validators.required, Validators.pattern(/^\+?[0-9\s-]{7,15}$/)],
         ],
         isDefault: [phone?.isDefault || false],
      });
   }
   addPhoneNumber(): void {
      this.phoneNumbersArray.push(this.createPhoneNumberFormGroup());
   }
   removePhoneNumber(index: number): void {
      this.phoneNumbersArray.removeAt(index);
   }

   // Addresses
   get addressesArray(): FormArray {
      return this.profileForm.get('addresses') as FormArray;
   }
   createAddressFormGroup(address?: ContactAddress): FormGroup {
      return this.fb.group({
         country: [address?.country || '', Validators.required],
         county: [address?.county || ''],
         postalCode: [
            address?.postalCode || '',
            [Validators.required, Validators.pattern(/^\d{4,10}$/)],
         ],
         city: [address?.city || '', Validators.required],
         streetAddress: [address?.streetAddress || '', Validators.required],
         type: [address?.type || 'permanent', Validators.required],
      });
   }
   addAddress(): void {
      this.addressesArray.push(this.createAddressFormGroup());
   }
   removeAddress(index: number): void {
      this.addressesArray.removeAt(index);
   }

   // Websites
   get websitesArray(): FormArray {
      return this.profileForm.get('websites') as FormArray;
   }
   createWebsiteFormGroup(website?: Website): FormGroup {
      return this.fb.group({
         url: [
            website?.url || '',
            [
               Validators.required,
               Validators.pattern(
                  /^(https?:\/\/)?([\w\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
               ),
            ],
         ],
         type: [website?.type || 'personal'],
      });
   }
   addWebsite(): void {
      this.websitesArray.push(this.createWebsiteFormGroup());
   }
   removeWebsite(index: number): void {
      this.websitesArray.removeAt(index);
   }

   // BankAccounts
   get bankAccountsArray(): FormArray {
      return this.profileForm.get('bankAccounts') as FormArray;
   }
   createBankAccountFormGroup(account?: BankAccount): FormGroup {
      return this.fb.group({
         accountNumber: [account?.accountNumber || '', Validators.required],
         owner: [account?.owner || ''],
         type: [account?.type || 'domestic', Validators.required],
         bankName: [account?.bankName || ''],
         isValid: [account?.isValid === undefined ? true : account.isValid],
         isDefault: [account?.isDefault || false],
      });
   }
   addBankAccount(): void {
      this.bankAccountsArray.push(this.createBankAccountFormGroup());
   }
   removeBankAccount(index: number): void {
      this.bankAccountsArray.removeAt(index);
   }

   onSubmit(): void {
      if (!this.currentUser || !this.currentUser._id) {
         this.notificationService.show(
            'error',
            'User data not available for update.'
         );
         return;
      }
      if (this.profileForm.invalid) {
         this.notificationService.show(
            'error',
            'Please correct the errors in the form.'
         );
         this.profileForm.markAllAsTouched();
         return;
      }

      this.isLoading = true;
      const formValue = this.profileForm.getRawValue();
      const updatedUserData: Partial<User> = {
         _id: this.currentUser._id,
         // Include only fields that are actually editable and part of the form's value
         nickname: formValue.nickname,
         profilePicture: formValue.profilePicture,
         theme: formValue.theme,
         language: formValue.language,
         emails: formValue.emails,
         phoneNumbers: formValue.phoneNumbers.map((p: any) => ({
            ...p,
            number: String(p.number).replace(/\s|-/g, ''),
         })),
         addresses: formValue.addresses,
         websites: formValue.websites,
         bankAccounts: formValue.bankAccounts,
         preferences: formValue.userSettings,
         // Fields like firstName, lastName, username are taken from this.currentUser if needed,
         // or excluded if the backend doesn't expect them / can't change them via this endpoint.
         // For this update, we are sending only what the form can change.
      };

      this.userService
         .updateUser(this.currentUser._id, updatedUserData)
         .subscribe({
            next: (response: any) => {
               this.isLoading = false;
               this.notificationService.show(
                  'success',
                  'Profile updated successfully!'
               );
               if (response.user) {
                  // If admin edited another user, don't update current authService user
                  if (!this.isEditingOtherUser) {
                     this.authService.updateCurrentUser(response.user as User);
                  } else {
                     // Optionally, refresh the data for the edited user if staying on page
                     this.currentUser = response.user;
                     this.populateForm(response.user);
                  }
               }
            },
            error: (err: any) => {
               this.isLoading = false;
               this.notificationService.show(
                  'error',
                  err.message || 'Failed to update profile.'
               );
               console.error('Profile update error:', err);
            },
         });
   }

   ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
   }
}
