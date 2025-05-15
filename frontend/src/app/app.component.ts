import { Component, Input, OnInit } from '@angular/core';
import {
   ActivatedRoute,
   NavigationEnd,
   Router,
   RouterOutlet,
} from '@angular/router';

import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { filter, map, mergeMap } from 'rxjs';

@Component({
   selector: 'app-root',
   imports: [RouterOutlet, FooterComponent, HeaderComponent],
   templateUrl: './app.component.html',
   styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
   public showHeader: boolean = true;

   constructor(
      private router: Router,
      private activatedRoute: ActivatedRoute
   ) {}

   ngOnInit() {
      this.router.events
         .pipe(
            filter((event) => event instanceof NavigationEnd),
            map(() => this.activatedRoute),
            map((route) => {
               while (route.firstChild) {
                  route = route.firstChild;
               }
               return route;
            }),
            mergeMap((route) => route.data)
         )
         .subscribe((data) => {
            this.showHeader =
               data['hideHeader'] === undefined || !data['hideHeader'];
         });
   }
}
