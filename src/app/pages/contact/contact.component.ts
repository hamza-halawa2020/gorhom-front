import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { CallToActionSectionComponent } from "../../components/call-to-action-section/call-to-action-section.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-contact-page",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
  imports: [CommonModule, NavbarComponent, CallToActionSectionComponent, FooterComponent],
})
export class ContactComponent {}
