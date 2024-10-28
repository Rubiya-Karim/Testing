import { TestBed } from '@angular/core/testing';

import { EceOperationService } from './ece-operation.service';

describe('EceOperationService', () => {
  let service: EceOperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EceOperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
