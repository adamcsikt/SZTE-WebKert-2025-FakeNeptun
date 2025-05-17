import {
   Pipe,
   PipeTransform,
   inject,
   OnDestroy,
   ChangeDetectorRef,
} from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
   name: 'translate',
   standalone: true,
   pure: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
   private i18nService = inject(I18nService);
   private cdRef = inject(ChangeDetectorRef);

   private langChangeSubscription: Subscription | undefined;
   private lastKey: string | null = null;
   private lastValue: string = '';

   constructor() {
      this.langChangeSubscription = this.i18nService.currentLanguage$.subscribe(
         () => {
            this.cdRef.markForCheck();
         }
      );
   }

   transform(key: string): string {
      if (
         key === this.lastKey &&
         this.i18nService.getCurrentLanguage() ===
            this.i18nService.getCurrentLanguage()
      ) {
      }
      this.lastKey = key;
      this.lastValue = this.i18nService.translate(key);
      return this.lastValue;
   }

   ngOnDestroy(): void {
      if (this.langChangeSubscription) {
         this.langChangeSubscription.unsubscribe();
      }
   }
}
