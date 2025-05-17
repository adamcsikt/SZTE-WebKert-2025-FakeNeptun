// src/app/core/services/i18n.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

interface Translations {
   [key: string]: string;
}

@Injectable({
   providedIn: 'root',
})
export class I18nService {
   private http = inject(HttpClient);

   private currentTranslations = new BehaviorSubject<Translations>({});
   public currentTranslations$: Observable<Translations> =
      this.currentTranslations.asObservable();

   private currentLanguageSubject = new BehaviorSubject<string>(
      localStorage.getItem('currentLanguage') || 'EN'
   );
   public currentLanguage$: Observable<string> =
      this.currentLanguageSubject.asObservable();

   constructor() {
      this.currentLanguage$
         .pipe(switchMap((lang) => this.loadTranslationsForLanguage(lang)))
         .subscribe();

      window.addEventListener('storage', (event) => {
         if (
            event.key === 'currentLanguage' &&
            event.newValue &&
            event.newValue !== this.getCurrentLanguage()
         ) {
            this.setLanguage(event.newValue);
         }
      });
   }

   private loadTranslationsForLanguage(lang: string): Observable<Translations> {
      const filePath = `/i18n/${lang.toLowerCase()}.json`;
      return this.http.get<Translations>(filePath).pipe(
         tap((translations) => {
            this.currentTranslations.next(translations);
            console.log(`Translations loaded for ${lang}:`, translations);
         }),
         catchError((error) => {
            console.error(
               `Failed to load translations for ${lang} from ${filePath}`,
               error
            );
            this.currentTranslations.next({});
            return of({});
         })
      );
   }

   public getCurrentLanguage(): string {
      return this.currentLanguageSubject.getValue();
   }

   public setLanguage(lang: string): void {
      if (lang !== this.getCurrentLanguage()) {
         localStorage.setItem('currentLanguage', lang);
         this.currentLanguageSubject.next(lang);
      }
   }

   public translate(key: string): string {
      const translations = this.currentTranslations.getValue();
      return translations[key] || key;
   }
}
