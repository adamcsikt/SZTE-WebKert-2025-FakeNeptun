import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormValidatorPipe } from '../../../shared/pipes/form-validator.pipe';

import { AuthService } from '../../../core/services/auth.service';
import { LoginService } from '../../../core/services/login.service';
import { NotificationService } from '../../../core/services/notification.service';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

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
export class LoginComponent implements OnInit {
   private loginService = inject(LoginService);
   private authService = inject(AuthService);
   private notificationService = inject(NotificationService);
   private router = inject(Router);
   private route = inject(ActivatedRoute);
   private returnUrl!: string;

   loginForm: FormGroup = new FormGroup({
      username: new FormControl(''),
      password: new FormControl(''),
   });

   constructor() {}

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

      const { username, password } = this.loginForm.value;
      console.log('LoginComponent: Submitting login for username:', username);

      this.loginService.login(username, password).subscribe({
         next: () => {
            console.log(
               'LoginComponent: Firebase sign-in successful. Navigating...'
            );
            this.notificationService.show('success', 'Login successful!');
            this.router.navigateByUrl(this.returnUrl);
         },
         error: (error: any) => {
            console.error(
               'LoginComponent: Login failed via LoginService',
               error
            );
         },
      });
   }
}
