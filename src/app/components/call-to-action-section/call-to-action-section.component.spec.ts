import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallToActionSectionComponent } from './call-to-action-section.component';

describe('CallToActionSectionComponent', () => {
  let component: CallToActionSectionComponent;
  let fixture: ComponentFixture<CallToActionSectionComponent>;

  beforeEach(async () => {  
    await TestBed.configureTestingModule({
      imports: [CallToActionSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallToActionSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
