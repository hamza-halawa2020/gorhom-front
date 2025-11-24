import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
@Injectable({
    providedIn: 'root',
})
export class CertificationService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get(`${this.apiUrl}/certificates`);
    }

    showBySerialNumber(id: string) {
        return this.http.get(`${this.apiUrl}/certificates-serial/${id}`);
    }

    downloadFile(id: string) {
        return this.http.get(`${this.apiUrl}/certificates-downloadFile/${id}`, {
            responseType: 'blob',
        });
    }
}
