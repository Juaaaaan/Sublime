import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Badge } from './badge';

describe('Badge', () => {
  let component: Badge;
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render content', () => {
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent.trim()).toBe('');
  });

  it('should apply default variant classes by default', () => {
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('bg-surface-container');
  });

  it('should apply primary variant classes', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('bg-primary-container');
  });

  it('should apply secondary variant classes', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('bg-secondary-container');
  });

  it('should apply outline variant classes', () => {
    fixture.componentRef.setInput('variant', 'outline');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('border-outline-variant');
  });

  it('should apply the token typography classes in every variant', () => {
    // `badge.ts:17` llevaba `font-label-sm`, una clase que no emitia CSS.
    // Se afirma sobre el DOM renderizado, no sobre el getter, para que la
    // aserveracion sobreviva al paso de `classes` a `computed()`.
    const typography = ['text-label-sm', 'font-semibold', 'tracking-label', 'uppercase'];

    for (const variant of ['default', 'primary', 'secondary', 'outline'] as const) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('span');
      const classes = badge.className.split(/\s+/);
      for (const cls of typography) {
        expect(classes).toContain(cls);
      }
      expect(classes).not.toContain('font-label-sm');
    }
  });

  it('should apply sm size classes', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.className).toContain('text-[10px]');
  });
});
