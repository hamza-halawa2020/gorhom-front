import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    private apiUrl = environment.backEndUrl;
    private data = '/products';
    
    constructor(
        private http: HttpClient,
        private translateService: TranslateService
    ) {}
    
    index() {
        const currentLang = this.translateService.currentLang || 'en';
        return this.http.get(`${this.apiUrl}${this.data}?lang=${currentLang}`);
    }
}
