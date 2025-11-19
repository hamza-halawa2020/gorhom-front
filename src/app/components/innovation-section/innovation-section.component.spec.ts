import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnovationSectionComponent } from './innovation-section.component';

describe('InnovationSectionComponent', () => {
  let component: InnovationSectionComponent;
  let fixture: ComponentFixture<InnovationSectionComponent>;

  beforeEach(async () => {  
    await TestBed.configureTestingModule({
      imports: [InnovationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InnovationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
