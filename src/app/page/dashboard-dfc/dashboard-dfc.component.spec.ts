import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDfcComponent } from './dashboard-dfc.component';

describe('DashboardDfcComponent', () => {
  let component: DashboardDfcComponent;
  let fixture: ComponentFixture<DashboardDfcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDfcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDfcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
