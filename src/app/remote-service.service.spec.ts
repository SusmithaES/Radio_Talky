import { TestBed } from '@angular/core/testing';

import { RemoteServiceService } from './remote-service.service';

describe('RemoteServiceService', () => {
  let service: RemoteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RemoteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
