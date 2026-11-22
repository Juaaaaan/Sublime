import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
  standalone: true,
  imports: [Modal],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [size]="size"
      [title]="title"
      [closeable]="closeable"
      [closeLabel]="closeLabel"
      (closed)="onClosed()"
    >
      <p>Contenido del modal</p>
      <div modal-footer>
        <button id="footer-btn">Aceptar</button>
      </div>
    </app-modal>
    <button id="opener">Abrir</button>
  `,
})
class TestWrapperComponent {
  isOpen = false;
  size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  title = '';
  closeable = true;
  closeLabel = 'Cerrar';
  closedCalled = false;

  onClosed() {
    this.closedCalled = true;
  }
}

/**
 * Bajo zoneless el wrapper no se marca sucio al mutar una propiedad suya, asi que se
 * marca a mano y se espera a que el fixture se estabilice en lugar de llamar a
 * `detectChanges()` dos veces seguidas (que lanzaria NG0100).
 */
async function settle(fixture: ComponentFixture<TestWrapperComponent>): Promise<void> {
  fixture.changeDetectorRef.markForCheck();
  await fixture.whenStable();
}

describe('Modal (via TestWrapper)', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create wrapper and modal', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not render when isOpen is false', () => {
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('should render when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it('should render title when provided', () => {
    component.isOpen = true;
    component.title = 'Confirmar pedido';
    fixture.detectChanges();
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading).toBeTruthy();
    expect(heading.textContent.trim()).toBe('Confirmar pedido');
  });

  it('should emit closed when close button clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('[aria-label="Cerrar"]');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(component.closedCalled).toBeTrue();
  });

  // Spec: "Primitives carry no hardcoded UI copy" + "Icon-only controls are labelled".
  // El boton de cierre es solo icono, asi que su etiqueta la aporta quien usa el modal,
  // ya traducida por Transloco; el primitivo no lleva texto propio.
  it('should take the close button label from the caller', async () => {
    component.isOpen = true;
    component.closeLabel = 'Close dialog';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[aria-label="Close dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Cerrar"]')).toBeNull();
  });

  it('should emit closed on Escape key', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.closedCalled).toBeTrue();
  });

  it('should not close on non-Escape key', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.closedCalled).toBeFalse();
  });

  it('should not emit closed when closeable is false', () => {
    component.isOpen = true;
    component.closeable = false;
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('[aria-label="Cerrar"]');
    expect(closeBtn).toBeNull();
  });

  it('should render projected content', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('p');
    expect(content).toBeTruthy();
    expect(content.textContent.trim()).toBe('Contenido del modal');
  });

  it('should render footer slot content', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('[modal-footer]');
    expect(footer).toBeTruthy();
  });

  it('should apply md size class by default', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.className).toContain('max-w-lg');
  });

  it('should apply sm size class when configured', () => {
    component.isOpen = true;
    component.size = 'sm';
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.className).toContain('max-w-sm');
  });

  it('should apply lg size class when configured', () => {
    component.isOpen = true;
    component.size = 'lg';
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.className).toContain('max-w-2xl');
  });

  it('should apply full size class when configured', () => {
    component.isOpen = true;
    component.size = 'full';
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    // `full` usa el token de contenedor del sistema (`--container-content`), no
    // `max-w-full mx-sm`, que duplicaba el margen horizontal de la clase base.
    expect(panel.className).toContain('max-w-content');
    expect(panel.className).not.toContain('mx-sm');
  });

  it('should close on backdrop click', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.click();
    expect(component.closedCalled).toBeTrue();
  });

  it('should not close when clicking inside the panel', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    panel.click();
    expect(component.closedCalled).toBeFalse();
  });

  it('should reflect a hot size change in the markup', async () => {
    // Escenario «Class strings react to input changes»: con `panelClasses` como getter
    // el cambio podia no llegar al marcado bajo zoneless + OnPush.
    component.isOpen = true;
    fixture.detectChanges();
    const panel = () => fixture.nativeElement.querySelector('[cdktrapfocus]') as HTMLElement;
    expect(panel().className).toContain('max-w-lg');

    component.size = 'lg';
    await settle(fixture);
    expect(panel().className).toContain('max-w-2xl');
    expect(panel().className).not.toContain('max-w-lg');

    component.size = 'sm';
    await settle(fixture);
    expect(panel().className).toContain('max-w-sm');
  });

  it('should keep the ambient elevation and the safe margin in every size', async () => {
    component.isOpen = true;
    fixture.detectChanges();
    for (const size of ['sm', 'md', 'lg', 'full'] as const) {
      component.size = size;
      await settle(fixture);
      const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
      expect(panel.className).toContain('shadow-ambient');
      expect(panel.className).toContain('mx-margin-safe');
    }
  });

  // --- Escenario «Non-closeable modal» del spec ---

  it('should not emit closed on Escape when closeable is false', () => {
    component.isOpen = true;
    component.closeable = false;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.closedCalled).toBeFalse();
  });

  it('should not emit closed on backdrop click when closeable is false', () => {
    component.isOpen = true;
    component.closeable = false;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.click();
    expect(component.closedCalled).toBeFalse();
  });

  // --- Escenario «Focus trap» y foco devuelto al elemento que abrio el modal ---

  it('should move focus inside the modal while it is open', async () => {
    fixture.detectChanges();
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();

    component.isOpen = true;
    await settle(fixture);

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.hasAttribute('cdktrapfocusautocapture')).toBeTrue();
    expect(dialog.contains(document.activeElement)).toBeTrue();
    expect(document.activeElement).not.toBe(opener);
  });

  it('should return focus to the element that opened it when it closes', async () => {
    fixture.detectChanges();
    const opener = fixture.nativeElement.querySelector('#opener') as HTMLButtonElement;
    opener.focus();
    expect(document.activeElement).toBe(opener);

    component.isOpen = true;
    await settle(fixture);

    component.isOpen = false;
    await settle(fixture);

    expect(document.activeElement).toBe(opener);
  });

  // --- Escenario «Scroll lock in the browser» del spec ---

  it('should lock the body scroll while open and restore the previous value on close', async () => {
    const body = document.body;
    const original = body.style.overflow;
    body.style.overflow = 'scroll';

    component.isOpen = true;
    await settle(fixture);
    expect(body.style.overflow).toBe('hidden');

    component.isOpen = false;
    await settle(fixture);
    // Se restaura el valor previo, no una cadena vacia: otro componente puede tener
    // su propio bloqueo de scroll en marcha.
    expect(body.style.overflow).toBe('scroll');

    body.style.overflow = original;
  });
});

// --- Escenario «Server render does not touch the document» del spec ---

describe('Modal on the server platform', () => {
  it('should not touch the document when the platform is not a browser', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const body = document.body;
    const original = body.style.overflow;
    body.style.overflow = 'auto';

    const fixture = TestBed.createComponent(TestWrapperComponent);
    fixture.componentInstance.isOpen = true;
    await settle(fixture);

    expect(body.style.overflow).toBe('auto');

    fixture.componentInstance.isOpen = false;
    await settle(fixture);

    expect(body.style.overflow).toBe('auto');
    body.style.overflow = original;
  });
});
