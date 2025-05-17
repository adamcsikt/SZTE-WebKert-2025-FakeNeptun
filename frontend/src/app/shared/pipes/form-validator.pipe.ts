import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
   name: 'getFormError',
   standalone: true,
})
export class FormValidatorPipe implements PipeTransform {
   transform(
      errors: ValidationErrors | null,
      fieldName: string = 'This field'
   ): string | null {
      if (!errors) {
         return null;
      }

      if (errors['required']) {
         return `${fieldName} is required.`;
      }

      if (errors['minlength']) {
         return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters long.`;
      }

      if (errors['maxlength']) {
         return `${fieldName} must be at max ${errors['minlength'].requiredLength} characters long.`;
      }

      if (errors['pattern']) {
         return `${fieldName} has an invalid format.`;
      }

      return 'Invalid input.';
   }
}
