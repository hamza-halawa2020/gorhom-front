import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  address: string;
  passport: string;
  phone?: string;
  interest: string;
  investment_amount?: string | null;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = environment.apiUrl + '/contact';

  constructor(private http: HttpClient) {}

  sendContactForm(data: ContactFormData): Observable<any> {
    // console.log('ContactService - Sending to:', this.apiUrl);
    // console.log('ContactService - Data:', data);

    return this.http.post(this.apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }
}
