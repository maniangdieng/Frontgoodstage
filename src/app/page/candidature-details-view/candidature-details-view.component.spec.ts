import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatureDetailsViewComponent } from './candidature-details-view.component';

describe('CandidatureDetailsViewComponent', () => {
  let component: CandidatureDetailsViewComponent;
  let fixture: ComponentFixture<CandidatureDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CandidatureDetailsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatureDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
