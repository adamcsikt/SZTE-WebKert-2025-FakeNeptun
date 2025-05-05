import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';
import { LoginService } from '../../../core/services/login.service';
import { NotificationService } from '../../../core/services/notification.service';

import { User } from '../../../core/models/user.model';

import { Router } from '@angular/router';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [ReactiveFormsModule, MatButtonModule],
   templateUrl: './login.component.html',
   styleUrl: './login.component.css',
})
export class LoginComponent {
   loginForm: FormGroup = new FormGroup({
      username: new FormControl(''),
      password: new FormControl(''),
   });

   constructor(
      private authService: AuthService,
      private loginService: LoginService,
      private notificationService: NotificationService,
      private router: Router
   ) {}

   LogIn() {
      if (this.loginForm.invalid) {
         this.notificationService.show(
            'error',
            'Please enter username and password.'
         );
         return;
      }

      const formData = this.loginForm.value;
      console.log('LoginComponent: Submitting login form...', formData);

      this.loginService.login(formData.username, formData.password).subscribe({
         next: (response: any) => {
            console.log('Login successful raw response', response);

            if (!response || !response.token || !response.user) {
               console.error(
                  'LoginComponent: Invalid response structure received.',
                  response
               );

               this.notificationService.show(
                  'error',
                  'Login failed: Unexpected server response.'
               );

               this.authService.logout();
            }

            console.log(
               'LoginComponent: Response valid. Updating AuthService state...'
            );

            this.authService.handleSuccessfulLogin(
               response.token,
               response.user as User
            );

            this.notificationService.show('success', 'Login successful!');

            console.log('LoginComponent: Navigating to /dashboard...');
            this.router.navigateByUrl('/dashboard');
         },
         error: (e) => {
            console.error('Login failed', e);
            const message = e?.e?.message || e?.message || 'Login failed!';
            this.notificationService.show('error', message);
            this.authService.logout();
         },
      });
   }
}
