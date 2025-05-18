import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router'; // RouterLink for navigation
import { TranslatePipe } from '../../pipes/translate.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';

export interface NavItem {
   labelKey: string;
   icon?: string;
   route?: string;
   isSvg?: boolean;
   children?: NavItem[];
   isDivider?: boolean;
}

@Component({
   selector: 'app-nav-menu',
   standalone: true,
   imports: [
      CommonModule,
      RouterLink,
      TranslatePipe,
      MatIconModule,
      MatDividerModule,
   ],
   templateUrl: './nav-menu.component.html',
   styleUrls: ['./nav-menu.component.css'],
})
export class NavMenuComponent {
   isMainMenuOpen = false;
   openSubmenuLabelKey: string | null = null;

   menuItems: NavItem[] = [
      { labelKey: 'MENU_FAVORITES', icon: 'star', route: '/favorites' },
      { labelKey: 'MENU_HOMEPAGE', icon: 'home', route: '/dashboard' },
      { labelKey: 'MENU_CALENDAR', icon: 'calendar_today', route: '/calendar' },
      { labelKey: 'MENU_STUDIES', icon: 'school', route: '/studies' },
      {
         labelKey: 'MENU_SUBJECTS',
         icon: 'folder_open',
         children: [
            {
               labelKey: 'MENU_SUBJECT_REGISTRATION',
               route: '/subjects/registration',
            },
            {
               labelKey: 'MENU_REGISTERED_SUBJECTS',
               route: '/subjects/registered',
            },
            {
               labelKey: 'MENU_REGISTERED_COURSES',
               route: '/courses/registered',
            },
            { labelKey: 'MENU_TASKS', route: '/tasks' },
            { labelKey: 'MENU_OFFERED_GRADES', route: '/grades/offered' },
            {
               labelKey: 'MENU_SUBJECT_RECOGNITION_RULES',
               route: '/subjects/recognition-rules',
            },
         ],
      },
      { labelKey: 'MENU_EXAMS', icon: 'assignment', route: '/exams' },
      {
         labelKey: 'MENU_FINANCES',
         icon: 'account_balance_wallet',
         route: '/finances',
      },
      {
         labelKey: 'MENU_ADMINISTRATION',
         icon: 'settings',
         route: '/administration',
      },
      { isDivider: true, labelKey: 'DIVIDER_INFO_SEP' },
      {
         labelKey: 'MENU_INFORMATION',
         icon: 'info_outline',
         route: '/information',
      },
   ];

   constructor(private router: Router, private elementRef: ElementRef) {
      this.router.events
         .pipe(filter((event) => event instanceof NavigationEnd))
         .subscribe(() => {
            this.closeFullMenu(); // Close menu after any navigation
         });
   }

   toggleMainMenu(event: MouseEvent): void {
      event.stopPropagation();
      this.isMainMenuOpen = !this.isMainMenuOpen;
      if (!this.isMainMenuOpen) {
         this.openSubmenuLabelKey = null;
      }
   }

   // Handles clicks on items that might have submenus or be direct links
   handleItemClick(event: MouseEvent, item: NavItem): void {
      event.stopPropagation();
      if (item.isDivider) return;

      if (item.children && item.children.length > 0) {
         // This item is a parent with a submenu
         if (this.openSubmenuLabelKey === item.labelKey) {
            this.openSubmenuLabelKey = null; // Toggle off
         } else {
            this.openSubmenuLabelKey = item.labelKey; // Toggle on
         }
         // If the parent item itself is also a link (has a 'route' property),
         // and you want to navigate *and* toggle submenu, that's a more complex UX.
         // For now, clicking a parent only toggles its submenu.
         // If it also has a route and no children, or you want it to navigate
         // routerLink on the <a> tag will handle it if not prevented.
      } else if (item.route) {
         // This item is a direct link (no children)
         // RouterLink will handle the navigation.
         // The NavigationEnd subscription will close the menu.
         // No need to call this.router.navigate() here if using routerLink.
      }
   }

   // Handles clicks on submenu items (which are always direct links)
   handleSubItemClick(event: MouseEvent, subItem: NavItem): void {
      event.stopPropagation();
   }

   closeFullMenu(): void {
      this.isMainMenuOpen = false;
      this.openSubmenuLabelKey = null;
   }

   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent): void {
      if (
         this.isMainMenuOpen &&
         !this.elementRef.nativeElement.contains(event.target)
      ) {
         this.closeFullMenu();
      }
   }

   // Utility to prevent default <a> tag behavior if it's just a submenu trigger
   preventNavIfSubmenuTrigger(event: MouseEvent, item: NavItem): void {
      if (item.children && item.children.length > 0 && !item.route) {
         // If it's primarily a submenu trigger and has no route of its own, prevent default.
         event.preventDefault();
      }
   }
}
