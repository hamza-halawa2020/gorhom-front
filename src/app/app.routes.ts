import {Routes} from "@angular/router";
import {IndexComponent} from "./pages/index/index.component";
import {PresentationComponent} from "./pages/presentation/presentation.component";
import {LanguageGuard} from "./guards/language.guard";
import {AutoLanguageRedirectGuard} from "./guards/auto-language-redirect.guard";
import {RootRedirectComponent} from "./components/root-redirect/root-redirect.component";
import { ProductComponent } from "./pages/products/product.component";
import { BlogComponent } from "./pages/blog/blog.component";
import { BlogPostComponent } from "./pages/blog/blog-post.component";
import { ProductDetailComponent } from "./pages/products/product-detail.component";
import { VisionComponent } from "./pages/vision/vision.component";
import { InnovationComponent } from "./pages/innovation/innovation.component";
import { CrowComponent } from "./pages/crow/crow.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { InvestComponent } from "./pages/invest/invest.component";
import { RegisterComponent } from "./pages/register/register.component";
import { LoginComponent } from "./pages/login/login.component";

export const routes: Routes = [
  // Redirect root to current language
  {path: "", component: RootRedirectComponent},

  // Language-based routes
  {
    path: ":lang",
    component: IndexComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/presentation",
    component: PresentationComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/vision",
    component: VisionComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/innovation",
    component: InnovationComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/crow",
    component: CrowComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/register",
    component: RegisterComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/login",
    component: LoginComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/contact",
    component: ContactComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/invest",
    component: InvestComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/products",
    component: ProductComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/products/:id",
    component: ProductDetailComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/blog",
    component: BlogComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/blog/:slug",
    component: BlogPostComponent,
    canActivate: [LanguageGuard],
  },

  // Catch-all for any routes without language prefix
  {
    path: "**",
    canActivate: [AutoLanguageRedirectGuard],
    children: [],
  },
];
