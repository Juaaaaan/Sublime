import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Callout } from './callout';

/** Host de formulario: el aviso del nodo `3:1581` vive dentro del formulario de contacto. */
@Component({
  imports: [Callout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form>
      <app-callout>Tu consulta o encargo no queda formalizado hasta la confirmacion.</app-callout>
    </form>
  `,
})
class CalloutHost {}

describe('Callout', () => {
  let component: Callout;
  let fixture: ComponentFixture<Callout>;

  const box = () => fixture.nativeElement.querySelector('div') as HTMLElement;
  const classList = () => box().className.split(/\s+/);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Callout, CalloutHost],
    }).compileComponents();

    fixture = TestBed.createComponent(Callout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should declare OnPush change detection', () => {
    // Escenario «Change detection strategy» del spec.
    expect((Callout as unknown as { ɵcmp: { onPush: boolean } }).ɵcmp.onPush).toBeTrue();
  });

  // Escenario «Callout renders its message»: borde izquierdo de 4px, fondo tenue, italica.
  it('should apply the advisory treatment of the node', () => {
    const expected = [
      'bg-surface-container-low',
      'border-l-4',
      'border-deep-moss',
      'rounded-field',
      'text-body-sm',
      'italic',
      'text-deep-moss',
    ];

    for (const cls of expected) {
      expect(classList()).toContain(cls);
    }
  });

  it('should use the nearest named spacing tokens for its padding', () => {
    // El nodo da 20/16/15/16 y no hay token de 20px ni de 15px: `p-sm` con `pl-md`.
    expect(classList()).toContain('p-sm');
    expect(classList()).toContain('pl-md');
    expect(classList().some((cls) => cls.includes('['))).toBeFalse();
  });

  // Escenario «Callout renders its message»: el mensaje llega de quien lo usa.
  it('should render the message it receives from the caller', async () => {
    const host = TestBed.createComponent(CalloutHost);
    await host.whenStable();

    const rendered = host.nativeElement.querySelector('app-callout div') as HTMLElement;
    expect(rendered.textContent!.trim()).toBe(
      'Tu consulta o encargo no queda formalizado hasta la confirmacion.',
    );
  });

  // Escenario «Callout is announced»: contenido del formulario, no oculto a a11y.
  it('should stay accessible as content of the form', async () => {
    const host = TestBed.createComponent(CalloutHost);
    await host.whenStable();

    const form = host.nativeElement.querySelector('form') as HTMLElement;
    const rendered = host.nativeElement.querySelector('app-callout div') as HTMLElement;

    expect(form.contains(rendered)).toBeTrue();
    expect(rendered.hasAttribute('aria-hidden')).toBeFalse();
    expect(rendered.getAttribute('role')).toBeNull();
    expect(form.textContent).toContain('no queda formalizado');
  });

  // Escenario «Text comes from the caller»: el aviso no aporta texto propio.
  it('should render no copy of its own', () => {
    expect(box().textContent!.trim()).toBe('');
  });

  // Escenario «Class strings react to input changes» (D-5): clases por `computed()`, no getter.
  it('should expose its classes through a computed signal', async () => {
    const first = component.classes();
    await fixture.whenStable();

    expect(first).toBe(component.classes());
    // Angular normaliza el orden de las clases al aplicarlas, se comparan como conjunto.
    expect(classList().sort()).toEqual(first.split(/\s+/).sort());
  });
});
