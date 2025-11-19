import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { InnovationSectionComponent } from "../../components/innovation-section/innovation-section.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-innovation-page",
  templateUrl: "./innovation.component.html",
  styleUrls: ["./innovation.component.css"],
  imports: [CommonModule, NavbarComponent, InnovationSectionComponent, FooterComponent],
})
export class InnovationComponent {}
