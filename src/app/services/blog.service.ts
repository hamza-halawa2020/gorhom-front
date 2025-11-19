// src/app/services/blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BlogPost } from '../pages/blog/blog-posts';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://blog.hpsaviation.net/wp-json/wp/v2/posts';
  private mediaUrl = 'https://blog.hpsaviation.net/wp-json/wp/v2/media';

  constructor(private http: HttpClient) {}

  getPosts(page: number = 1, perPage: number = 10): Observable<BlogPost[]> {
    return this.http
      .get<BlogPost[]>(`${this.apiUrl}?per_page=${perPage}&page=${page}`)
      .pipe(
        switchMap((posts: any[]) => {
          const postRequests = posts.map((post: BlogPost) => {
            if (post.featured_media === 0) {
              return new Observable<BlogPost>((observer) => {
                observer.next(post);
                observer.complete();
              });
            }
            return this.getMediaById(post.featured_media).pipe(
              map(
                (media: any) =>
                  ({
                    ...post,
                    featured_image_url: media.source_url,
                    featured_image_alt: media.alt_text || '',
                  } as BlogPost)
              )
            );
          });
          return forkJoin(postRequests);
        })
      );
  }

  getPostById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`).pipe(
      switchMap((post: any) => {
        if (post.featured_media === 0) {
          return new Observable<BlogPost>((observer) => {
            observer.next(post);
            observer.complete();
          });
        }
        return this.getMediaById(post.featured_media).pipe(
          map(
            (media: any) =>
              ({
                ...post,
                featured_image_url: media.source_url,
                featured_image_alt: media.alt_text || '',
              } as BlogPost)
          )
        );
      })
    );
  }

  getPostBySlug(slug: string) {
    return this.http.get<BlogPost[]>(`${this.apiUrl}?slug=${slug}`).pipe(
      switchMap((posts: any[]) => {
        if (!posts.length)
          return new Observable<null>((observer) => {
            observer.next(null);
            observer.complete();
          });

        const post = posts[0];
        if (post.featured_media === 0) {
          return new Observable<BlogPost>((observer) => {
            observer.next(post);
            observer.complete();
          });
        }
        return this.getMediaById(post.featured_media).pipe(
          map(
            (media: any) =>
              ({
                ...post,
                featured_image_url: media.source_url,
                featured_image_alt: media.alt_text || '',
              } as BlogPost)
          )
        );
      })
    );
  }

  private getMediaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.mediaUrl}/${id}`);
  }
}
