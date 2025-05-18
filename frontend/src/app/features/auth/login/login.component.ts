import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormValidatorPipe } from '../../../shared/pipes/form-validator.pipe';

import { AuthService } from '../../../core/services/auth.service';
import { LoginService } from '../../../core/services/login.service';
import { NotificationService } from '../../../core/services/notification.service';

import { User } from '../../../core/models/user.model';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LogoutService } from '../../../core/services/logout.service';

@Component({
   selector: 'app-login',
   imports: [
      ReactiveFormsModule,
      MatButtonModule,
      FormValidatorPipe,
      NgIf,
      TranslatePipe,
      RouterLink,
   ],
   templateUrl: './login.component.html',
   styleUrl: './login.component.css',
})
export class LoginComponent {
   private logoutService = inject(LogoutService);
   private returnUrl!: string;

   loginForm: FormGroup = new FormGroup({
      username: new FormControl(''),
      password: new FormControl(''),
   });

   constructor(
      private authService: AuthService,
      private loginService: LoginService,
      private notificationService: NotificationService,
      private router: Router,
      private route: ActivatedRoute
   ) {}

   ngOnInit(): void {
      this.returnUrl =
         this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
   }

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

               this.logoutService.logoutUser().subscribe();
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
            this.router.navigateByUrl(this.returnUrl);
         },
         error: (e) => {
            console.error('Login failed', e);
            const message = e?.e?.message || e?.message || 'Login failed!';
            this.notificationService.show('error', message);
            this.logoutService.logoutUser().subscribe();
         },
      });
   }
}
