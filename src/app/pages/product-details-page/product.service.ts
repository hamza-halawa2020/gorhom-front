import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private apiUrl = environment.backEndUrl;
    private data = '/products';
    
    constructor(
        private http: HttpClient,
        private translateService: TranslateService
    ) {}
    
    show(id: number) {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}${this.data}/${id}?lang=${currentLang}`);
    }

    allSocial() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}/social-links?lang=${currentLang}`);
    }

    addReview(item: any) {
        return this.http.post(`${this.apiUrl}/reviews`, item);
    }
    
    addClientReview(item: any) {
        return this.http.post(`${this.apiUrl}/reviews`, item);
    }
}
