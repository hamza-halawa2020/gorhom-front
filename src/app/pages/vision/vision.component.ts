import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { VisionSectionComponent } from "../../components/vision-section/vision-section.component";
import { FooterComponent } from "../../components/footer/footer.component";
import { ProblemSectionComponent } from "../../components/problem-section/problem-section.component";
import { HummingPropulsionSimulatorComponent } from "../../components/humming-propulsion-simulator/humming-propulsion-simulator.component";

@Component({
  selector: "app-vision-page",
  templateUrl: "./vision.component.html",
  styleUrls: ["./vision.component.css"],
  imports: [CommonModule, NavbarComponent, VisionSectionComponent, ProblemSectionComponent, HummingPropulsionSimulatorComponent, FooterComponent],
})
export class VisionComponent {}
