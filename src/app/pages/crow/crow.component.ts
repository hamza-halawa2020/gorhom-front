import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { CrowAircraftSectionComponent } from "../../components/crow-aircraft-section/crow-aircraft-section.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-crow-page",
  templateUrl: "./crow.component.html",
  styleUrls: ["./crow.component.css"],
  imports: [CommonModule, NavbarComponent, CrowAircraftSectionComponent, FooterComponent],
})
export class CrowComponent {}
