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

import { RegisterService } from '../../../core/services/register.service'; // Create this service
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { FormValidatorPipe } from '../../../shared/pipes/form-validator.pipe'; // Assuming you have this
import { User } from '../../../core/models/user.model';

// Custom validator for password matching
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
   styleUrls: ['./register.component.css'], // Create this CSS file
})
export class RegisterComponent implements OnInit {
   registerForm!: FormGroup;
   isLoading = false;
   hidePassword = true;
   hideConfirmPassword = true;

   private fb = inject(FormBuilder);
   private registerService = inject(RegisterService);
   private authService = inject(AuthService);
   private notificationService = inject(NotificationService);
   private router = inject(Router);

   genders: string[] = ['Male', 'Female', 'Other']; // Or fetch from a service/config

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
            training: ['', Validators.required], // e.g., BSc in Computer Science
            startDate: [
               new Date().toISOString().split('T')[0],
               Validators.required,
            ], // Default to today
            // Optional fields
            nickname: [''],
            tajNumber: ['', [Validators.pattern(/^\d{9}$/)]], // Example pattern for 9 digits
            taxId: ['', [Validators.pattern(/^\d{10}$/)]], // Example pattern for 10 digits
            educationId: [''], // No specific pattern for now
         },
         { validators: passwordsMatcher }
      );
   }

   get f() {
      return this.registerForm.controls;
   }

   onSubmit(): void {
      if (this.registerForm.invalid) {
         this.notificationService.show(
            'error',
            'Please fill all required fields correctly.'
         );
         this.registerForm.markAllAsTouched(); // Mark all fields as touched to show errors
         return;
      }
      this.isLoading = true;

      const formValue = this.registerForm.value;
      const userData: Partial<User> = {
         ...formValue,
         dateOfBirth: new Date(formValue.dateOfBirth)
            .toISOString()
            .split('T')[0], // Format date
         startDate: new Date(formValue.startDate).toISOString().split('T')[0], // Format date
      };
      delete userData['confirmPassword' as keyof User]; // Remove confirmPassword before sending

      this.registerService.register(userData).subscribe({
         next: (response: any) => {
            this.isLoading = false;
            this.notificationService.show(
               'success',
               'Registration successful! Please log in.'
            );
            if (response && response.token && response.user) {
               this.authService.handleSuccessfulLogin(
                  response.token,
                  response.user as User
               );
               this.router.navigate(['/dashboard']);
            } else {
               this.router.navigate(['/login']);
            }
         },
         error: (err) => {
            this.isLoading = false;
            this.notificationService.show(
               'error',
               err.message || 'Registration failed. Please try again.'
            );
            console.error('Registration error:', err);
         },
      });
   }
}
