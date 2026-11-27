import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';

import { Contact } from './contact';
import { environment } from '../../../environments/environment';
import { TRANSLOCO_CONST_CONFIG } from '../../shared/consts/translations/transloco.const';

describe('Contact', () => {
  let fixture: ComponentFixture<Contact>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact, TranslocoTestingModule.forRoot(TRANSLOCO_CONST_CONFIG)],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should link to WhatsApp using the number without symbols', () => {
    const link = el.querySelector<HTMLAnchorElement>('a[href^="https://wa.me/"]');

    expect(link?.getAttribute('href')).toBe('https://wa.me/34690071950');
    expect(link?.textContent).toContain(environment.contact.whatsappDisplay);
  });

  it('should link to the contact email and show the address', () => {
    const link = el.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');

    expect(link?.getAttribute('href')).toBe('mailto:hola@sublimecraftart.es');
    expect(link?.textContent).toContain('hola@sublimecraftart.es');
  });

  it('should not render a form that cannot send messages', () => {
    expect(el.querySelector('form')).toBeNull();
  });
});
