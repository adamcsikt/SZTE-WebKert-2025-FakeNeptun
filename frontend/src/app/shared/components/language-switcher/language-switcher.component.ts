// src/app/shared/components/language-switcher/language-switcher.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Subscription } from 'rxjs';

interface Language {
   code: string;
   labelKey: string;
}

@Component({
   selector: 'app-language-switcher',
   standalone: true,
   imports: [
      CommonModule,
      MatButtonModule,
      MatMenuModule,
      MatIconModule,
      TranslatePipe,
   ],
   templateUrl: './language-switcher.component.html',
   styleUrl: './language-switcher.component.css',
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
   private i18nService = inject(I18nService);

   public availableLanguages: Language[] = [
      { code: 'EN', labelKey: 'LANGUAGE_EN' },
      { code: 'HU', labelKey: 'LANGUAGE_HU' },
   ];

   public currentLanguage: string = 'EN';
   private langChangeSubscription: Subscription | undefined;

   ngOnInit(): void {
      this.langChangeSubscription = this.i18nService.currentLanguage$.subscribe(
         (lang) => {
            this.currentLanguage = lang;
         }
      );
   }

   switchLanguage(langCode: string): void {
      this.i18nService.setLanguage(langCode);
   }

   ngOnDestroy(): void {
      if (this.langChangeSubscription) {
         this.langChangeSubscription.unsubscribe();
      }
   }
}
