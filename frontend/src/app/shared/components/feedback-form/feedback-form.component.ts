import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import {
   FormBuilder,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FormValidatorPipe } from '../../pipes/form-validator.pipe';
import {
   Feedback,
   FeedbackService,
} from '../../../core/services/feedback.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-feedback-form',
   standalone: true,
   imports: [
      CommonModule,
      ReactiveFormsModule,
      TranslatePipe,
      FormValidatorPipe,
      MatIconModule,
      NgIf,
   ],
   templateUrl: './feedback-form.component.html',
   styleUrls: ['./feedback-form.component.css'],
})
export class FeedbackFormComponent implements OnInit {
   @Output() closeForm = new EventEmitter<void>();
   feedbackForm!: FormGroup;
   isLoading = false;
   feedbackTypes = ['bug', 'suggestion', 'compliment', 'other'];
   ratings = [1, 2, 3, 4, 5];
   currentRating = 0;

   private fb = inject(FormBuilder);
   private feedbackService = inject(FeedbackService);
   private notificationService = inject(NotificationService);
   protected authService = inject(AuthService);

   constructor() {}

   ngOnInit(): void {
      const currentUser = this.authService.currentUserValue;
      let userEmail = '';
      if (currentUser && currentUser.email) {
         userEmail = currentUser.email;
      }

      this.feedbackForm = this.fb.group({
         email: [userEmail, [Validators.email]],
         feedbackType: ['suggestion', Validators.required],
         message: [
            '',
            [
               Validators.required,
               Validators.minLength(10),
               Validators.maxLength(1000),
            ],
         ],
         rating: [0],
      });
   }

   get f() {
      return this.feedbackForm.controls;
   }

   setRating(rating: number): void {
      this.currentRating = rating;
      this.feedbackForm.get('rating')?.setValue(rating);
   }

   onSubmit(): void {
      if (this.feedbackForm.invalid) {
         this.notificationService.show(
            'error',
            'Please fill in all required fields correctly.'
         );
         this.feedbackForm.markAllAsTouched();
         return;
      }
      this.isLoading = true;
      const feedbackData: Feedback = {
         email: this.f['email'].value || undefined,
         feedbackType: this.f['feedbackType'].value,
         message: this.f['message'].value,
         rating: this.f['rating'].value || undefined,
      };

      this.feedbackService.sendFeedback(feedbackData).subscribe({
         next: () => {
            this.isLoading = false;
            this.feedbackForm.reset({
               email: this.feedbackForm.get('email')?.value,
               feedbackType: 'suggestion',
               rating: 0,
            });
            this.currentRating = 0;
            this.closeForm.emit();
         },
         error: () => {
            this.isLoading = false;
         },
      });
   }

   onClose(): void {
      this.closeForm.emit();
   }
}
