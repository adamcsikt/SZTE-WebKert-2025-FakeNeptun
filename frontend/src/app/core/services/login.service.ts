import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
   providedIn: 'root',
})
export class LoginService {
   constructor(private http: HttpClient) {}

   login(username: string, password: string): Observable<any> {
      const headers = new HttpHeaders({
         'Content-Type': 'application/json',
      });

      return this.http.post(
         `${environment.apiURL}/login`,
         {
            username,
            password,
         },
         {
            headers: headers,
            withCredentials: true,
         }
      );
   }
}
