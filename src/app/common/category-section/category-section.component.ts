import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from './category.service';
import { environment } from '../../../environments/environment.development';

@Component({
    selector: 'app-category-section',
    standalone: true,
    imports: [RouterLink, TranslateModule, CommonModule],
    templateUrl: './category-section.component.html',
    styleUrls: ['./category-section.component.scss'],
})
export class CategorySectionComponent implements OnInit {
    data: any[] = [];
    image = environment.imgUrl + 'categories/';

    constructor(
        public translateService: TranslateService,
        private categoryService: CategoryService
    ) {}

    fetchData() {
        this.categoryService.index().subscribe({
            next: (response) => {
                let categories = Array.isArray(response)
                    ? response
                    : (Object.values(response)[0] as any[]);
                this.data = this.getRandomCategories(categories);
                this.getRandomCategories(categories);
                // console.log(this.data);
                this.translateData();
            },
        });
    }

    getRandomCategories(categories: any[]): any[] {
        return categories.sort(() => Math.random() - 0.5).slice(0, 4);
    }

    translateData() {
        if (!this.data || !Array.isArray(this.data)) return;

        this.data.forEach((category: any) => {
            if (category.name && category.name.trim()) {
                category.translatedTitle =
                    this.translateService.instant(category.name) ||
                    category.name;
            } else {
                // console.warn('Category name is missing or empty:', category);
                category.translatedTitle = 'UNKNOWN_CATEGORY';
            }
        });
    }

    ngOnInit(): void {
        this.fetchData();
        this.translateService.onLangChange.subscribe(() => {
            this.translateData();
        });
    }
}
