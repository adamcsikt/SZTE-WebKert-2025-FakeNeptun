import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FeedbackFormComponent } from '../feedback-form/feedback-form.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
   selector: 'app-footer',
   standalone: true,
   imports: [
      CommonModule,
      LanguageSwitcherComponent,
      TranslatePipe,
      FeedbackFormComponent,
      MatIconModule,
      NgIf,
   ],
   templateUrl: './footer.component.html',
   styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
   showFeedbackForm = false;

   toggleFeedbackForm(): void {
      this.showFeedbackForm = !this.showFeedbackForm;
   }
}
