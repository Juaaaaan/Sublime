import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chip } from './chip';

/** Host de proyeccion: el chip no tiene texto propio, su etiqueta llega por `ng-content`. */
@Component({
  imports: [Chip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-chip
      [interactive]="interactive()"
      [selected]="selected()"
      (selectedChange)="onChange($event)"
    >
      Anillos
    </app-chip>
  `,
})
class ChipHost {
  readonly interactive = signal(false);
  readonly selected = signal(false);
  readonly emitted: boolean[] = [];

  onChange(next: boolean): void {
    this.emitted.push(next);
  }
}

describe('Chip', () => {
  let component: Chip;
  let fixture: ComponentFixture<Chip>;

  const span = () => fixture.nativeElement.querySelector('span') as HTMLElement | null;
  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement | null;
  const chip = () => (button() ?? span()) as HTMLElement;
  const classList = () => chip().className.split(/\s+/);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chip, ChipHost],
    }).compileComponents();

    fixture = TestBed.createComponent(Chip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should declare OnPush change detection', () => {
    // Escenario «Change detection strategy» del spec.
    expect((Chip as unknown as { ɵcmp: { onPush: boolean } }).ɵcmp.onPush).toBeTrue();
  });

  // Escenario «Unselected chip»: nodo `3:75`, fondo tenue de superficie con texto deep-moss.
  it('should render the unselected treatment by default', () => {
    expect(component.selected()).toBeFalse();
    expect(classList()).toContain('bg-surface-container-low');
    expect(classList()).toContain('text-deep-moss');
    expect(classList()).not.toContain('bg-deep-moss');
  });

  // Escenario «Selected chip»: nodo `3:73`, fondo deep-moss con texto blanco.
  it('should render the selected treatment when selected', async () => {
    fixture.componentRef.setInput('selected', true);
    await fixture.whenStable();

    expect(classList()).toContain('bg-deep-moss');
    expect(classList()).toContain('text-on-primary');
    expect(classList()).not.toContain('bg-surface-container-low');
  });

  // Escenario «Chip presents a selectable pill»: forma de 12px y etiqueta de 12px en mayusculas.
  it('should apply the pill shape and the label typography of the node', () => {
    const expected = [
      'rounded-chip',
      'px-sm',
      'py-chip-y',
      'text-label-sm',
      'font-extrabold',
      'uppercase',
      'tracking-label',
    ];

    for (const cls of expected) {
      expect(classList()).toContain(cls);
    }
  });

  // Escenario «Chip presents a selectable pill»: limite visible y altura del nodo.
  it('should draw a visible 1px boundary in both states without changing height', async () => {
    expect(classList()).toContain('border');
    expect(classList()).toContain('border-outline');
    // Altura real: el borde cabe dentro de los 24px del nodo `3:73` gracias a `h-6`.
    expect(chip().offsetHeight).toBe(24);
    expect(getComputedStyle(chip()).borderTopWidth).toBe('1px');

    fixture.componentRef.setInput('selected', true);
    await fixture.whenStable();

    expect(classList()).toContain('border-deep-moss');
    expect(classList()).not.toContain('border-outline');
    expect(chip().offsetHeight).toBe(24);
  });

  // Escenario «Interactive chip»: accionable con puntero y estado expuesto a a11y.
  it('should render a native button exposing its selected state when interactive', async () => {
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    expect(button()).toBeTruthy();
    expect(span()).toBeNull();
    expect(button()!.getAttribute('type')).toBe('button');
    expect(button()!.getAttribute('aria-pressed')).toBe('false');

    fixture.componentRef.setInput('selected', true);
    await fixture.whenStable();
    expect(button()!.getAttribute('aria-pressed')).toBe('true');
  });

  it('should show a visible focus ring when interactive', async () => {
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    expect(classList()).toContain('cursor-pointer');
    expect(classList()).toContain('focus-visible:outline-2');
    expect(classList()).toContain('focus-visible:outline-offset-2');
    expect(classList()).toContain('focus-visible:outline-primary');
  });

  it('should be focusable when interactive', async () => {
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    button()!.focus();
    expect(document.activeElement).toBe(button());
  });

  // Escenario «Interactive chip»: emite su seleccion al activarse con click.
  it('should emit the next selected state on click', async () => {
    const emitted: boolean[] = [];
    component.selectedChange.subscribe((next) => emitted.push(next));
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    button()!.click();
    expect(emitted).toEqual([true]);

    fixture.componentRef.setInput('selected', true);
    await fixture.whenStable();
    button()!.click();
    expect(emitted).toEqual([true, false]);
  });

  /**
   * Escenario «Interactive chip»: activacion con teclado. La activacion con Enter y con
   * Espacio la aporta el `<button type="button">` nativo, que sintetiza el click; el
   * componente no tiene manejador de teclado propio (lo tenia, y solo servia para
   * cancelar el click que el propio navegador generaba).
   *
   * Lo que se comprueba aqui es la condicion de la que depende ese comportamiento: el
   * chip accionable es un boton nativo enfocable, no un `div` con `role`, y su click
   * emite. La pulsacion de tecla real no se puede simular desde Karma (un
   * `KeyboardEvent` sintetico no genera el click), asi que esa ultima pieza la cubre el
   * navegador y no este test.
   */
  it('should be a focusable native button whose click emits, which is what gives it keyboard activation', async () => {
    const emitted: boolean[] = [];
    component.selectedChange.subscribe((next) => emitted.push(next));
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    expect(button()!.tagName).toBe('BUTTON');
    expect(button()!.type).toBe('button');

    button()!.focus();
    expect(document.activeElement).toBe(button());

    button()!.click();
    expect(emitted).toEqual([true]);
  });

  it('should not react to keys that do not activate a native button', async () => {
    const emitted: boolean[] = [];
    component.selectedChange.subscribe((next) => emitted.push(next));
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
    button()!.dispatchEvent(event);

    expect(event.defaultPrevented).toBeFalse();
    expect(emitted).toEqual([]);
  });

  // Escenario «Static chip»: no enfocable y sin eventos.
  it('should render a span that is neither focusable nor emitting when static', async () => {
    const emitted: boolean[] = [];
    component.selectedChange.subscribe((next) => emitted.push(next));
    await fixture.whenStable();

    expect(span()).toBeTruthy();
    expect(button()).toBeNull();
    expect(span()!.hasAttribute('tabindex')).toBeFalse();
    expect(span()!.hasAttribute('aria-pressed')).toBeFalse();

    const previouslyFocused = document.activeElement;
    span()!.focus();
    expect(document.activeElement).toBe(previouslyFocused);

    span()!.click();
    span()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(emitted).toEqual([]);
  });

  // Escenario «Class strings react to input changes» (D-5): sin `detectChanges()` manual.
  it('should reflect a hot change of selected and interactive without manual detection', async () => {
    expect(span()).toBeTruthy();
    expect(classList()).toContain('bg-surface-container-low');

    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('interactive', true);
    await fixture.whenStable();

    expect(button()).toBeTruthy();
    expect(classList()).toContain('bg-deep-moss');
    expect(classList()).toContain('cursor-pointer');

    fixture.componentRef.setInput('selected', false);
    fixture.componentRef.setInput('interactive', false);
    await fixture.whenStable();

    expect(span()).toBeTruthy();
    expect(classList()).toContain('bg-surface-container-low');
    expect(classList()).not.toContain('cursor-pointer');
  });

  // Escenario «Text comes from the caller»: el chip no aporta texto propio.
  it('should project the label of the caller in both modes', async () => {
    const host = TestBed.createComponent(ChipHost);
    await host.whenStable();

    const projected = () => host.nativeElement.querySelector('app-chip') as HTMLElement;
    expect(projected().textContent!.trim()).toBe('Anillos');

    host.componentInstance.interactive.set(true);
    await host.whenStable();
    expect(host.nativeElement.querySelector('button')!.textContent!.trim()).toBe('Anillos');

    host.nativeElement.querySelector('button')!.click();
    expect(host.componentInstance.emitted).toEqual([true]);
  });

  it('should render no copy of its own', () => {
    expect(span()!.textContent!.trim()).toBe('');
  });
});
