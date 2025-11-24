import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
    providedIn: 'root',
})
export class RegisterService {
    private apiUrl = environment.backEndUrl;
    private data = '/register';
    constructor(private http: HttpClient) {}
    register(data: FormData) {
        return this.http.post(`${this.apiUrl}${this.data}`, data);
    }
}
