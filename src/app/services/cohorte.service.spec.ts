import { TestBed } from '@angular/core/testing';

import { CohorteService } from './cohorte.service';

describe('CohorteService', () => {
  let service: CohorteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CohorteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
