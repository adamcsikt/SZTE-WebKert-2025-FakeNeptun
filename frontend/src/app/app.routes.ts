import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
   {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
   },
   {
      path: 'login',
      loadComponent: () =>
         import('./features/auth/login/login.component').then(
            (c) => c.LoginComponent
         ),
      canActivate: [loginGuard],
      data: { hideHeader: true },
   },
   {
      path: 'register',
      loadComponent: () =>
         import('./features/auth/register/register.component').then(
            (c) => c.RegisterComponent
         ),
      canActivate: [loginGuard],
      data: { hideHeader: true },
   },
   {
      path: 'dashboard',
      loadComponent: () =>
         import('./pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
         ),
      canActivate: [authGuard],
   },
   {
      path: 'profile',
      loadComponent: () =>
         import('./pages/profile/profile.component').then(
            (c) => c.ProfileComponent
         ),
      canActivate: [authGuard],
   },
   {
      path: 'users/',
      loadComponent: () =>
         import('./pages/user/user.component').then((c) => c.UserComponent),
      canActivate: [authGuard],
   },
   {
      path: 'users/:id',
      loadComponent: () =>
         import('./pages/user/user.component').then((c) => c.UserComponent),
      canActivate: [authGuard],
   },

   {
      path: '**',
      loadComponent: () =>
         import('./pages/error/error.component').then((c) => c.ErrorComponent),
   },
];
