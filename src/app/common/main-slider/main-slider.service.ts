import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { MAIN_SLIDER_DATA } from './main-sliders';

@Injectable({
    providedIn: 'root',
})
export class MainSliderService {
    private apiUrl = environment.backEndUrl;
    private data = '/main-sliders';
    constructor(private http: HttpClient) { }
    // index() {
    //     return this.http.get(`${this.apiUrl}${this.data}`);
    // }


    index() {
        return {
            subscribe: (observer: any) => {
                observer.next(MAIN_SLIDER_DATA);
                observer.complete?.();
            }
        };
    }
}
