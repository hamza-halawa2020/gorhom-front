import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private apiUrl = environment.backEndUrl;
    private data = '/profile';
    constructor(private http: HttpClient) {}
    index() {
        return this.http.get(`${this.apiUrl}${this.data}`);
    }

    updateAddress(id: number, address: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/addresses/${id}`, address);
    }

    deleteAddress(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/addresses/${id}`);
    }

    updateProfile(userId: number, formData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/${userId}`, formData);
    }
}
