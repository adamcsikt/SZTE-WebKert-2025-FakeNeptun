import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
   providedIn: 'root',
})
export class NotificationService {
   private defaultConfig: MatSnackBarConfig = {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
   };

   constructor(private snackbar: MatSnackBar) {}

   show(
      type: string = 'info',
      message: string,
      action: string = 'Close',
      config?: MatSnackBarConfig
   ): void {
      this.snackbar.open(message, action, {
         ...this.defaultConfig,
         panelClass: ['snackbar', `${type}-snackbar`],
         ...config,
      });
   }

   dismiss(): void {
      this.snackbar.dismiss();
   }
}
