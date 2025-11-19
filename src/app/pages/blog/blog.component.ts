import { environment } from './../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from './blog-posts';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { LoadingCarComponent } from '../../components/loading-car/loading-car.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    LoadingCarComponent,
    FooterComponent,
    HttpClientModule,
  ],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  isLoading = true;
  page = 1;
  perPage = 5;
  allLoaded = false;

  constructor(
    private blogService: BlogService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    if (this.allLoaded) return;

    const scrollPos = window.scrollY;

    this.blogService.getPosts(this.page, this.perPage).subscribe({
      next: (posts) => {
        if (posts.length < this.perPage) this.allLoaded = true;
        this.posts.push(...posts);
        this.page++;
        this.isLoading = false;

        setTimeout(() => {
          window.scrollTo(0, scrollPos);
        }, 50);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  openPost(post: BlogPost) {
    const lang = this.route.snapshot.paramMap.get('lang') || 'en';
    this.router.navigate(['/', lang, 'blog', post.slug]);
  }

  truncateWords(html: string | undefined, wordLimit = 25): string {
    if (!html) return '';
    const text = html
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }
}
