// src/app/pages/error/error.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
   selector: 'app-error',
   standalone: true,
   imports: [TranslatePipe, MatButtonModule, MatIconModule, RouterLink],
   templateUrl: './error.component.html',
   styleUrls: ['./error.component.css'],
})
export class ErrorComponent {}
