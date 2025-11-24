import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../common/navbar/navbar.component';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BackToTopComponent } from '../../common/back-to-top/back-to-top.component';
import { CertificationService } from './certification.service';
import { environment } from '../../../environments/environment.development';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-certification-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        NgClass,
        NgIf,
        NavbarComponent,
        PageBannerComponent,
        FooterComponent,
        BackToTopComponent,
        HttpClientModule,
        TranslateModule,
    ],
    templateUrl: './certification-page.component.html',
    styleUrls: ['./certification-page.component.scss'],
    providers: [CertificationService],
})
export class CertificationPageComponent implements OnInit {
    successMessage: string = '';
    errorMessage: string = '';

    certificates: any;
    apiImage = `${environment.imgUrl}/Certifications/`;
    serialNumber: any;
    formSubmitted: boolean = false;

    constructor(
        private certificationService: CertificationService,
        private sanitizer: DomSanitizer
    ) {}

    sanitizeUrl(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnInit(): void {}

    submitForm = new FormGroup({
        serialNumber: new FormControl('', [Validators.required]),
    });

    loadCertificateBySerial(id: string): void {
        this.certificationService.showBySerialNumber(id).subscribe(
            (res: any) => {
                this.certificates = Object.values(res)[0];

                // console.log(this.certificates); 

                this.successMessage = res.message || 'Your Certification !';
                setTimeout(() => {
                    this.successMessage = '';
                }, 1000);
            },
            (error) => {
                this.errorMessage =
                    error.error?.error || 'An unexpected error occurred.';

                setTimeout(() => {
                    this.errorMessage = '';
                }, 1000);
            }
        );
    }

    downloadFile(id: any) {
        this.certificationService.downloadFile(id).subscribe(
            (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.certificates.serial_number;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.successMessage =
                    'Your Certification Downloaded successfully !';
                setTimeout(() => {
                    this.successMessage = '';
                }, 1000);
            },
            (error) => {
                this.errorMessage =
                    error.error?.message ||
                    'Error occurred during file download:';
                setTimeout(() => {
                    this.errorMessage = '';
                }, 1000);
            }
        );
    }

    Submitted(): void {
        if (this.submitForm.valid) {
            this.serialNumber = this.submitForm.get('serialNumber')!.value;
            this.loadCertificateBySerial(this.serialNumber);
        } else {
            this.errorMessage = 'Invalid form';
            setTimeout(() => {
                this.errorMessage = '';
            }, 1000);
        }
    }
}
