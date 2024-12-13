import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCardExtractionComponent } from './id-card-extraction.component';

describe('IdCardExtractionComponent', () => {
  let component: IdCardExtractionComponent;
  let fixture: ComponentFixture<IdCardExtractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdCardExtractionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IdCardExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
