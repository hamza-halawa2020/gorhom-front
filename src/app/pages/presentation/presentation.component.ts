import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
} from "@angular/core";
import {Select2Module} from "ng-select2-component";
import {SlickCarouselModule} from "ngx-slick-carousel";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image-more";
import {TranslatePipe} from "../../pipes/translate.pipe";
import {LanguageService} from "../../services/language.service";
import {InvestorDeckTrackingService} from "../../services/investor-deck-tracking.service";

@Component({
  selector: "app-presentation",
  templateUrl: "./presentation.component.html",
  styleUrls: ["./presentation.component.css"],
  standalone: true,
  imports: [CommonModule, Select2Module, SlickCarouselModule, TranslatePipe],
})
export class PresentationComponent implements OnInit, OnDestroy {
  @ViewChild("presentationContent") presentationContent!: ElementRef;
  currentSlide: number = 0;
  slides: number[] = Array(14).fill(0);
  progressWidth: number = 0;
  isDownloading: boolean = false;

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private investorDeckTrackingService: InvestorDeckTrackingService
  ) {}

  ngOnInit(): void {
    this.updateProgressBar();

    // Track investor deck view
    this.investorDeckTrackingService.trackDeckView(
      "hps-investor-deck",
      this.slides.length
    );
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  @HostListener("window:keydown", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Prevent default behavior for navigation keys
    if (["ArrowLeft", "ArrowRight", "Escape"].includes(event.key)) {
      event.preventDefault();
    }

    // Check if current language is RTL (Arabic)
    const isRTL = this.languageService.getCurrentLanguageValue() === "ar";

    switch (event.key) {
      case "ArrowRight":
        // In RTL: right arrow goes to previous slide, left arrow goes to next slide
        if (isRTL) {
          this.prevSlide();
        } else {
          this.nextSlide();
        }
        break;
      case "ArrowLeft":
        // In RTL: left arrow goes to next slide, right arrow goes to previous slide
        if (isRTL) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        break;
      case "Escape":
        this.goBack();
        break;
    }
  }

  updateProgressBar(): void {
    this.progressWidth = ((this.currentSlide + 1) / this.slides.length) * 100;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateProgressBar();

    // Track page change
    this.investorDeckTrackingService.trackPageChange(
      "hps-investor-deck",
      this.currentSlide + 1
    );
  }

  prevSlide(): void {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateProgressBar();

    // Track page change
    this.investorDeckTrackingService.trackPageChange(
      "hps-investor-deck",
      this.currentSlide + 1
    );
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateProgressBar();

    // Track page change
    this.investorDeckTrackingService.trackPageChange(
      "hps-investor-deck",
      this.currentSlide + 1
    );
  }

  downloadAsPdf(): void {
    if (!this.presentationContent) return;

    // Track deck download
    this.investorDeckTrackingService.trackDeckDownload("hps-investor-deck");

    this.isDownloading = true;
    const slides =
      this.presentationContent.nativeElement.querySelectorAll(".slide");
    const pdf = new jsPDF("p", "mm", "a4");
    let completedSlides = 0;

    slides.forEach((slide: HTMLElement) => {
      slide.style.opacity = "0";
      slide.style.position = "absolute";
      slide.style.display = "none";
      slide.style.width = "100vw";
      slide.style.height = "100vh";
    });

    const processSlide = (index: number) => {
      if (index >= slides.length) {
        slides.forEach((slide: HTMLElement, i: number) => {
          slide.style.opacity = i === this.currentSlide ? "1" : "0";
          slide.style.position = "absolute";
          slide.style.display = i === this.currentSlide ? "block" : "none";
          slide.style.width = "";
          slide.style.height = "";
        });
        pdf.save("HPS-Aviation-Presentation.pdf");
        this.isDownloading = false;
        return;
      }

      const slide = slides[index];
      slide.style.opacity = "1";
      slide.style.position = "relative";
      slide.style.display = "block";

      const svgs = slide.querySelectorAll("svg animateTransform");
      svgs.forEach((anim: HTMLElement) => anim.setAttribute("dur", "0s"));

      setTimeout(() => {
        domtoimage
          .toPng(slide, {
            bgcolor: "#0a1929",
            width: slide.offsetWidth * 2,
            height: slide.offsetHeight * 2,
            style: {
              transform: "scale(2)",
              transformOrigin: "top left",
            },
            quality: 0.98,
            cacheBust: true,
          })
          .then((dataUrl) => {
            if (index > 0) pdf.addPage();
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(dataUrl, "PNG", 10, 10, pdfWidth, pdfHeight);

            slide.style.opacity = "0";
            slide.style.position = "absolute";
            slide.style.display = "none";

            svgs.forEach((anim: HTMLElement) => anim.removeAttribute("dur"));

            processSlide(index + 1);
          })
          .catch((error) => {
            console.error(`Error processing slide ${index + 1}:`, error);
            this.isDownloading = false;
          });
      }, 200);
    };

    processSlide(0);
  }

  goBack(): void {
    // Track deck completion when exiting
    this.investorDeckTrackingService.trackDeckComplete("hps-investor-deck");

    this.router.navigate(["/"]);
  }
}
