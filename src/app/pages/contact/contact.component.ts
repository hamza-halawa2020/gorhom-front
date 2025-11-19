import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-contact-page",
  standalone: true,
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
  imports: [CommonModule, NavbarComponent, FooterComponent],
})
export class ContactComponent {}
