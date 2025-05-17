import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';

@Component({
   selector: 'app-widget',
   standalone: true,
   imports: [
      CommonModule,
      MatExpansionModule,
      MatIconModule,
      MatListModule,
      MatButtonModule,
      TranslatePipe,
      RouterLink,
   ],
   templateUrl: './widget.component.html',
   styleUrls: ['./widget.component.css'],
})
export class WidgetComponent {
   @Input() widgetTitleKey: string = '';
   @Input() iconName: string = '';
   @Input() notificationCount: number | string | null = null;
   @Input() initiallyExpanded: boolean = false;

   @Input() items: any[] = [];
   @Input() itemDisplayProperty: string = 'name';
   @Input() itemDetailProperty?: string;
   @Input() itemDateProperty?: string;

   @Input() viewAllLink?: string;
   @Input() viewAllLinkTextKey?: string;

   @Output() itemClicked = new EventEmitter<any>();

   onItemClick(item: any): void {
      this.itemClicked.emit(item);
   }
}
