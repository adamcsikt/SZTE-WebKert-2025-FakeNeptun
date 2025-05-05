import { Component, signal, WritableSignal } from '@angular/core';

@Component({
   selector: 'app-language-switcher',
   imports: [],
   templateUrl: './language-switcher.component.html',
   styleUrl: './language-switcher.component.css',
})
export class LanguageSwitcherComponent {
   language: WritableSignal<string> = signal<string>('EN');

   constructor() {
      localStorage.setItem('language', this.language());
   }

   switchLanguage(lang: string) {
      this.language.set(lang);
      localStorage.setItem('language', this.language());
      this.toggleSelection();
      window.location.reload();
   }

   toggleSelection() {
      const list = document.querySelector(
         '.language-switcher .list'
      ) as HTMLElement;
      list.classList.toggle('show');
   }
}
