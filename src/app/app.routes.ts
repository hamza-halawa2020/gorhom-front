import { Routes } from '@angular/router';
import { IndexComponent } from './pages/index/index.component';
import { LanguageGuard } from './guards/language.guard';
import { AutoLanguageRedirectGuard } from './guards/auto-language-redirect.guard';
import { RootRedirectComponent } from './components/root-redirect/root-redirect.component';
import { BlogComponent } from './pages/blog/blog.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  // Redirect root to current language
  { path: '', component: RootRedirectComponent },
  {
    path: ':lang',
    component: IndexComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ':lang/register',
    component: RegisterComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ':lang/login',
    component: LoginComponent,
    canActivate: [LanguageGuard],
  },

  {
    path: ':lang/blog',
    component: BlogComponent,
    canActivate: [LanguageGuard],
  },
   {
    path: '**',
    canActivate: [AutoLanguageRedirectGuard],
    children: [],
  },
];
