import { Component } from '@angular/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
   selector: 'app-footer',
   imports: [LanguageSwitcherComponent, TranslatePipe],
   templateUrl: './footer.component.html',
   styleUrl: './footer.component.css',
})
export class FooterComponent {}
