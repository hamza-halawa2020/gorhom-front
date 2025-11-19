import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost } from './blog-posts';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { BlogService } from '../../services/blog.service';
import { LoadingCarComponent } from '../../components/loading-car/loading-car.component';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    LoadingCarComponent,
  ],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css'],
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  lang = 'en';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    this.lang = this.route.snapshot.paramMap.get('lang') || 'en';
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.router.navigate(['/', this.lang, 'blog']);
      return;
    }

    this.blogService.getPostBySlug(slug).subscribe({
      next: (post) => {
        if (!post) {
          this.router.navigate(['/', this.lang, 'blog']);
        } else {
          this.post = post;
          this.isLoading = false;
        }
      },
      error: () => {
        this.router.navigate(['/', this.lang, 'blog']);
      },
    });
  }

  back() {
    this.router.navigate(['/', this.lang, 'blog']);
  }
}
