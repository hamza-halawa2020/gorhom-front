import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowAircraftSectionComponent } from './crow-aircraft-section.component';

describe('CrowAircraftSectionComponent', () => {
  let component: CrowAircraftSectionComponent;
  let fixture: ComponentFixture<CrowAircraftSectionComponent>;

  beforeEach(async () => {  
    await TestBed.configureTestingModule({
      imports: [CrowAircraftSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrowAircraftSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
