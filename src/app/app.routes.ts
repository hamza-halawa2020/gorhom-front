import { Routes } from '@angular/router';
import { HomeDemoOneComponent } from './demos/home-demo-one/home-demo-one.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { AboutPageComponent } from './pages/about-page/about-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';
import { TermsConditionsPageComponent } from './pages/terms-conditions-page/terms-conditions-page.component';
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AuthGuard } from './auth.guard';
import { unAuthGuard } from './un-auth.guard';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page/product-details-page.component';
import { CheckoutPageComponent } from './pages/checkout-page/checkout-page.component';
import { ForgetpasswordPageComponent } from './pages/forgetpassword-page/forgetpassword-page.component';
import { CartPageWrapperComponent } from './pages/cart-page-wrapper/cart-page-wrapper.component';
import { CartResolver } from './pages/cart-page-wrapper/cart.resolver';
import { PaymentStatusPageComponent } from './pages/payment-status-page/payment-status-page.component';
import { VerificationCodePageComponent } from './pages/verification-code-page/verification-code-page.component';
import { SendVerificationCodePageComponent } from './pages/send-verification-code-page/send-verification-code-page.component';
import { ResetpasswordPageComponent } from './pages/resetPassword-page/resetpassword-page.component';
import { CertificationPageComponent } from './pages/certification-page/certification-page.component';
import { ShopPageComponent } from './pages/shop-page/shop-page.component';
import { CategoryPageComponent } from './pages/category-page/category-page.component';
import { ReturnsRefundsPageComponent } from './pages/returns-refunds/returns-refunds-page.component';
import { ShippingDeliveryPageComponent } from './pages/shipping-delivery/shipping-delivery-page.component';

export const routes: Routes = [
    { path: '', component: HomeDemoOneComponent },
    { path: 'about', component: AboutPageComponent },
    { path: 'products', component: ProductPageComponent },
    { path: 'shop', component: ShopPageComponent },
    { path: 'product/:id', component: ProductDetailsPageComponent },
    { path: 'categories/:id', component: CategoryPageComponent },
    { path: 'checkout', component: CheckoutPageComponent },
    { path: 'payment-status', component: PaymentStatusPageComponent },
    { path: 'privacy-policy', component: PrivacyPolicyPageComponent },
    { path: 'returns-refunds', component: ReturnsRefundsPageComponent },
    { path: 'shipping-delivery', component: ShippingDeliveryPageComponent },
    { path: 'terms-conditions', component: TermsConditionsPageComponent },
    { path: 'certifications', component: CertificationPageComponent },
    { path: 'contacts', component: ContactPageComponent },
 
    {
        path: 'cart',
        component: CartPageWrapperComponent,
        resolve: { userType: CartResolver },
    },
    


    { path: '**', component: ErrorPageComponent },
];
