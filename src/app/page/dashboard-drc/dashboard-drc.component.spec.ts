import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDrcComponent } from './dashboard-drc.component';

describe('DashboardDrcComponent', () => {
  let component: DashboardDrcComponent;
  let fixture: ComponentFixture<DashboardDrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardDrcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardDrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
