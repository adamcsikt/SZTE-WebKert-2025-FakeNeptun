import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
   providedIn: 'root',
})
export class RegisterService {
   private apiUrl = `${environment.apiURL}/register`;
   private http = inject(HttpClient);

   constructor() {}

   register(userData: Partial<User>): Observable<any> {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post(this.apiUrl, userData, { headers });
   }
}
