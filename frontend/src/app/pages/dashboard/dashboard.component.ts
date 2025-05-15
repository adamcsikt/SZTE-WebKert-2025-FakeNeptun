import { Component } from '@angular/core';

@Component({
   selector: 'app-dashboard',
   imports: [],
   templateUrl: './dashboard.component.html',
   styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
   dashboard = {
      user: {
         name: 'Adamcsik Tamás',
      },
      widget: {
         name: 'widget',
      },
   };
}
