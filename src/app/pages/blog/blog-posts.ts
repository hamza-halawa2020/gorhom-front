export interface BlogPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;

  title: {
    rendered: string;
  };

  content: {
    rendered: string;
    protected: boolean;
  };

  excerpt: {
    rendered: string;
    protected: boolean;
  };

  author: number;
  featured_media: number;
  featured_image_url?: string;
  featured_image_alt?: string;

  categories: number[];
  tags: number[];

  meta: {
    footnotes: string;
  };

  _links: {
    self: { href: string }[];
    collection: { href: string }[];
    about: { href: string }[];
    author: { embeddable: boolean; href: string }[];
    replies: { embeddable: boolean; href: string }[];
    // version-history: { count: number; href: string }[];
    // "wp:attachment": { href: string }[];
    // "wp:term": {
    //   taxonomy: string;
    //   embeddable: boolean;
    //   href: string;
    // }[];
  };
}
