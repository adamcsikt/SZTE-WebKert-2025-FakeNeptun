import { Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
   selector: 'app-dashboard',
   imports: [TranslatePipe],
   templateUrl: './dashboard.component.html',
   styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
