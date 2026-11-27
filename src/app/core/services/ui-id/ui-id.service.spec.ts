import { TestBed } from '@angular/core/testing';

import { UiIdService } from './ui-id.service';

describe('UiIdService', () => {
  let service: UiIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UiIdService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should number each prefix from one, in order', () => {
    expect(service.next('modal')).toBe('modal-1');
    expect(service.next('modal')).toBe('modal-2');
    expect(service.next('modal')).toBe('modal-3');
  });

  it('should keep one count per prefix', () => {
    expect(service.next('app-input')).toBe('app-input-1');
    expect(service.next('app-select')).toBe('app-select-1');
    expect(service.next('app-input')).toBe('app-input-2');
  });

  /**
   * La razon de ser del servicio (decision D-7): un contador de modulo persiste entre
   * bootstraps del mismo proceso, asi que al prerenderizar varias rutas seguidas el
   * servidor y el cliente numeraban distinto y la hidratacion no coincidia. El inyector
   * raiz se recrea en cada bootstrap, asi que la cuenta vuelve a empezar.
   */
  it('should restart the count in a new injector, as a new bootstrap does', () => {
    expect(service.next('radio-group')).toBe('radio-group-1');
    expect(service.next('radio-group')).toBe('radio-group-2');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const afterBootstrap = TestBed.inject(UiIdService);

    expect(afterBootstrap).not.toBe(service);
    expect(afterBootstrap.next('radio-group')).toBe('radio-group-1');
  });
});
