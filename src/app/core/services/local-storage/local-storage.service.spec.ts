import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService]
    });
    service = TestBed.inject(LocalStorageService);

    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
