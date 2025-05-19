import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
   FormBuilder,
   FormGroup,
   Validators,
   ReactiveFormsModule,
   AbstractControl,
   ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { RegisterService } from '../../../core/services/register.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { FormValidatorPipe } from '../../../shared/pipes/form-validator.pipe';
import { User as AppUser } from '../../../core/models/user.model';

export function passwordsMatcher(
   control: AbstractControl
): ValidationErrors | null {
   const password = control.get('password');
   const confirmPassword = control.get('confirmPassword');
   return password &&
      confirmPassword &&
      password.value !== confirmPassword.value
      ? { passwordsNotMatching: true }
      : null;
}

@Component({
   selector: 'app-register',
   standalone: true,
   imports: [
      CommonModule,
      NgIf,
      RouterLink,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatSelectModule,
      MatIconModule,
      TranslatePipe,
      FormValidatorPipe,
   ],
   templateUrl: './register.component.html',
   styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
   registerForm!: FormGroup;
   isLoading = false;
   hidePassword = true;
   hideConfirmPassword = true;

   private fb = inject(FormBuilder);
   private registerService = inject(RegisterService);
   private notificationService = inject(NotificationService);
   private router = inject(Router);

   genders: string[] = ['Male', 'Female', 'Other'];

   ngOnInit(): void {
      this.registerForm = this.fb.group(
         {
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            username: [
               '',
               [
                  Validators.required,
                  Validators.minLength(6),
                  Validators.maxLength(6),
                  Validators.pattern(/^[a-zA-Z0-9_]+$/),
               ],
            ],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            countryOfBirth: ['', Validators.required],
            placeOfBirth: ['', Validators.required],
            citizenship: ['', Validators.required],
            gender: ['', Validators.required],
            training: ['', Validators.required],
            startDate: [
               new Date().toISOString().split('T')[0],
               Validators.required,
            ],
            nickname: [''],
            tajNumber: ['', [Validators.pattern(/^\d{9}$/)]],
            taxId: ['', [Validators.pattern(/^\d{10}$/)]],
            educationId: [''],
         },
         { validators: passwordsMatcher }
      );
   }

   get f() {
      return this.registerForm.controls;
   }

   onSubmit(): void {
      if (this.registerForm.invalid) {
         return;
      }
      this.isLoading = true;

      const formValue = this.registerForm.value;
      const passwordInPlainText = formValue.password;

      console.log(
         'RegisterComponent formValue:',
         JSON.stringify(formValue, null, 2)
      ); // debug

      const userData: Partial<AppUser> = {
         username: formValue.username,
         email: formValue.email,
         firstName: formValue.firstName,
         lastName: formValue.lastName,
         dateOfBirth: new Date(formValue.dateOfBirth)
            .toISOString()
            .split('T')[0],
         startDate: new Date(formValue.startDate).toISOString().split('T')[0],
         countryOfBirth: formValue.countryOfBirth,
         placeOfBirth: formValue.placeOfBirth,
         citizenship: formValue.citizenship,
         gender: formValue.gender,
         training: formValue.training,
         nickname: formValue.nickname || undefined,
         tajNumber: formValue.tajNumber || undefined,
         taxId: formValue.taxId || undefined,
         educationId: formValue.educationId || undefined,
      };

      console.log(
         'RegisterComponent userData to be sent:',
         JSON.stringify(userData, null, 2)
      );
      console.log(
         'RegisterComponent passwordInPlainText to be sent:',
         passwordInPlainText
            ? 'Exists and has length ' + passwordInPlainText.length
            : 'MISSING or empty'
      ); //debug

      this.registerService.register(userData, passwordInPlainText).subscribe({
         next: (registeredAppUser) => {
            this.isLoading = false;
            this.notificationService.show(
               'success',
               'Registration successful! Please log in.'
            );
            this.router.navigate(['/login']);
         },
         error: (err) => {
            this.isLoading = false;
            console.error('RegisterComponent: Registration error:', err);
         },
      });
   }
}
