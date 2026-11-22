import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button';

/**
 * Host con etiqueta proyectada: el fixture del componente suelto renderiza un boton
 * vacio, y sin contenido en linea la caja de texto mide 0, asi que la altura medida no
 * seria la del boton real.
 */
@Component({
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-button [size]="size">Enviar</app-button>`,
})
class ButtonHost {
  size: 'sm' | 'md' | 'lg' = 'md';
}

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  const nativeButton = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default inputs', () => {
    it('should default variant to "primary"', () => {
      expect(component.variant()).toBe('primary');
    });

    it('should default size to "md"', () => {
      expect(component.size()).toBe('md');
    });

    it('should default disabled to false', () => {
      expect(component.disabled()).toBeFalse();
    });

    it('should default loading to false', () => {
      expect(component.loading()).toBeFalse();
    });

    it('should default type to "button"', () => {
      expect(component.type()).toBe('button');
    });

    it('should default fullWidth to false', () => {
      expect(component.fullWidth()).toBeFalse();
    });
  });

  describe('base treatment', () => {
    it('should always include layout, shape and transition classes', () => {
      const classes = component.classes();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('items-center');
      expect(classes).toContain('justify-center');
      expect(classes).toContain('rounded-field');
      expect(classes).toContain('transition-all');
      expect(classes).toContain('duration-300');
      expect(classes).toContain('disabled:opacity-40');
    });

    it('should use the 12px uppercase CTA label', () => {
      const classes = component.classes();
      expect(classes).toContain('text-cta');
      expect(classes).toContain('uppercase');
      expect(classes).toContain('tracking-cta');
    });

    it('should not use a transition faster than 300ms', () => {
      const classes = component.classes();
      expect(classes).not.toContain('duration-100');
      expect(classes).not.toContain('duration-150');
      expect(classes).not.toContain('duration-200');
    });

    it('should not use arbitrary values nor inline hex colours', () => {
      expect(component.classes()).not.toMatch(/\[|#/);
    });
  });

  // Spec: «Primary variant» — fondo deep-moss, texto blanco, radio de campo
  // y etiqueta en mayusculas con el tracking de CTA (nodo 3:1584).
  describe('primary variant', () => {
    it('should render deep-moss background with white text by default', () => {
      const classes = component.classes();
      expect(classes).toContain('bg-deep-moss');
      expect(classes).toContain('text-on-primary');
    });

    it('should apply the approved treatment on the native element', async () => {
      await fixture.whenStable();
      const classes = nativeButton().className;
      expect(classes).toContain('bg-deep-moss');
      expect(classes).toContain('text-on-primary');
      expect(classes).toContain('rounded-field');
      expect(classes).toContain('uppercase');
      expect(classes).toContain('tracking-cta');
    });
  });

  // Spec: «Secondary variant» — fondo transparente y borde de 1px, conservando
  // radio, tipografia y transicion de la primaria.
  describe('secondary variant', () => {
    it('should render a transparent background with a 1px border', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      const classes = component.classes();
      expect(classes).toContain('bg-transparent');
      expect(classes).toContain('border');
      expect(classes).toContain('border-deep-moss');
      expect(classes).toContain('text-on-surface');
      expect(classes).not.toContain('bg-deep-moss');
    });

    it('should keep the radius, typography and transition of the primary variant', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      const secondary = component.classes();
      fixture.componentRef.setInput('variant', 'primary');
      const primary = component.classes();

      for (const shared of [
        'rounded-field',
        'text-cta',
        'uppercase',
        'tracking-cta',
        'transition-all',
        'duration-300',
      ]) {
        expect(primary).toContain(shared);
        expect(secondary).toContain(shared);
      }
    });
  });

  describe('ghost variant', () => {
    it('should render without border nor background, keeping the text treatment', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      const classes = component.classes();
      expect(classes).toContain('bg-transparent');
      expect(classes).toContain('text-on-surface');
      expect(classes).not.toContain('border');
      expect(classes).toContain('tracking-cta');
    });
  });

  describe('sizes', () => {
    it('should use the Figma padding for md', () => {
      const classes = component.classes();
      // nodo 3:1584: 32px horizontal, 14px vertical -> 44px de alto con label de 16px
      expect(classes).toContain('px-cta-x');
      expect(classes).toContain('py-cta-y');
    });

    it('should scale down for sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      const classes = component.classes();
      expect(classes).toContain('px-sm');
      expect(classes).toContain('py-xs');
    });

    it('should scale up for lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      const classes = component.classes();
      expect(classes).toContain('px-lg');
      expect(classes).toContain('py-md');
    });

    it('should reflect a size change in the rendered markup', async () => {
      fixture.componentRef.setInput('size', 'lg');
      await fixture.whenStable();
      expect(nativeButton().className).toContain('px-lg');
    });

    it('should not include w-full by default', () => {
      expect(component.classes()).not.toContain('w-full');
    });

    it('should include w-full when fullWidth is set', () => {
      fixture.componentRef.setInput('fullWidth', true);
      expect(component.classes()).toContain('w-full');
    });
  });

  // Spec: «Keyboard focus is visible» — indicador que no depende solo del color.
  describe('keyboard focus', () => {
    it('should expose a focus-visible outline with offset, not only a colour change', () => {
      const classes = component.classes();
      expect(classes).toContain('focus-visible:outline-2');
      expect(classes).toContain('focus-visible:outline-offset-2');
      expect(classes).toContain('focus-visible:outline-primary');
    });

    it('should be reachable with the keyboard', async () => {
      await fixture.whenStable();
      const button = nativeButton();
      button.focus();
      expect(document.activeElement).toBe(button);
      expect(button.tabIndex).toBe(0);
    });
  });

  describe('type', () => {
    it('should forward the type to the native element', async () => {
      fixture.componentRef.setInput('type', 'submit');
      await fixture.whenStable();
      expect(nativeButton().getAttribute('type')).toBe('submit');
    });
  });

  describe('click', () => {
    it('should emit clicked when not disabled and not loading', () => {
      const spy = jasmine.createSpy('clicked');
      component.clicked.subscribe(spy);
      component.onClick();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should emit clicked on a real click on the native element', async () => {
      const spy = jasmine.createSpy('clicked');
      component.clicked.subscribe(spy);
      await fixture.whenStable();
      nativeButton().click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // Spec: «Disabled button» — expone `disabled`, no emite su evento y se ve atenuado.
  describe('disabled state', () => {
    it('should expose disabled on the native element', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();
      expect(nativeButton().disabled).toBeTrue();
    });

    it('should not emit clicked when disabled', async () => {
      fixture.componentRef.setInput('disabled', true);
      const spy = jasmine.createSpy('clicked');
      component.clicked.subscribe(spy);
      await fixture.whenStable();
      nativeButton().click();
      component.onClick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should look dimmed and ignore pointer events when disabled', async () => {
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();
      const classes = nativeButton().className;
      expect(classes).toContain('disabled:opacity-40');
      expect(classes).toContain('disabled:pointer-events-none');
    });
  });

  // Spec: «Loading button» — no emite su evento y comunica el estado de forma accesible.
  describe('loading state', () => {
    it('should not emit clicked while loading', async () => {
      fixture.componentRef.setInput('loading', true);
      const spy = jasmine.createSpy('clicked');
      component.clicked.subscribe(spy);
      await fixture.whenStable();
      nativeButton().click();
      component.onClick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should announce the busy state and block the native control', async () => {
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();
      const button = nativeButton();
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.disabled).toBeTrue();
    });

    it('should render a decorative spinner hidden from assistive technology', async () => {
      fixture.componentRef.setInput('loading', true);
      await fixture.whenStable();
      const spinner = nativeButton().querySelector('svg');
      expect(spinner).toBeTruthy();
      expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not expose aria-busy nor a spinner when idle', async () => {
      await fixture.whenStable();
      const button = nativeButton();
      expect(button.hasAttribute('aria-busy')).toBeFalse();
      expect(button.querySelector('svg')).toBeNull();
    });
  });
});

/**
 * Altura real, no la cadena de clase: con `text-label-sm` (interlineado 1, caja de 12px)
 * el boton `md` media 40px y no los 44 del nodo `3:1584`. `text-cta` lleva la caja de
 * 16px dentro del token, asi que 14 + 16 + 14 = 44.
 */
describe('ButtonComponent (measured height)', () => {
  let fixture: ComponentFixture<ButtonHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ButtonHost] }).compileComponents();
    fixture = TestBed.createComponent(ButtonHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should measure 44px tall in the md size, like the node 3:1584', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    const styles = getComputedStyle(button);
    expect(styles.paddingTop).toBe('14px');
    expect(styles.paddingBottom).toBe('14px');
    // 1.3333 x 12px: el navegador devuelve 15.9996px, de ahi la tolerancia.
    expect(parseFloat(styles.lineHeight)).toBeCloseTo(16, 2);
    expect(button.getBoundingClientRect().height).toBeCloseTo(44, 1);
    expect(button.offsetHeight).toBe(44);
  });
});
