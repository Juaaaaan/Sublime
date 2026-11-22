import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { TRANSLOCO_CONST_CONFIG } from '../../../consts/translations/transloco.const';
import { FooterComponent } from './footer';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, TranslocoTestingModule.forRoot(TRANSLOCO_CONST_CONFIG)],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the current year', () => {
    expect(component.year).toBe(new Date().getFullYear());
  });

  it('should render the copyright text containing the current year', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(component.year.toString());
  });

  it('should render the logo link pointing to the home route', () => {
    const el: HTMLElement = fixture.nativeElement;
    const logoLink = el.querySelector<HTMLAnchorElement>('a[href="/"]');
    expect(logoLink).toBeTruthy();
    expect(logoLink!.textContent!.trim()).toBe('Sublime');
  });

  it('should render navigation links to /cuidados, /contacto and /personaliza', () => {
    const el: HTMLElement = fixture.nativeElement;
    const hrefs = Array.from(el.querySelectorAll<HTMLAnchorElement>('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('/cuidados');
    expect(hrefs).toContain('/contacto');
    expect(hrefs).toContain('/personaliza');
  });

  it('should render the link labels in the active language', () => {
    const el: HTMLElement = fixture.nativeElement;
    const labels = Array.from(el.querySelectorAll('a')).map((a) => a.textContent!.trim());
    expect(labels).toContain('Care and shipping');
    expect(labels).toContain('Contact');
    expect(labels).toContain('Customize your piece');
  });

  it('should translate the link labels and tagline when the language changes', async () => {
    TestBed.inject(TranslocoService).setActiveLang('es');
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const labels = Array.from(el.querySelectorAll('a')).map((a) => a.textContent!.trim());
    expect(labels).toContain('Cuidados y envíos');
    expect(labels).toContain('Personaliza tu pieza');
    expect(el.textContent).toContain('Hecho a mano con intención.');
  });
});
