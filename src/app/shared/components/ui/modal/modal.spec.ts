import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';

@Component({
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

  it('should not render the close button when closeable is false', () => {
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
    expect(panel.className).toContain('max-w-modal-md');
  });

  it('should apply sm size class when configured', () => {
    component.isOpen = true;
    component.size = 'sm';
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.className).toContain('max-w-modal-sm');
  });

  it('should apply lg size class when configured', () => {
    component.isOpen = true;
    component.size = 'lg';
    fixture.detectChanges();
    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]');
    expect(panel.className).toContain('max-w-modal-lg');
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

  /**
   * El clic se hace sobre el backdrop, el primer hijo del dialogo: es el elemento que
   * recibe de verdad los clics de la zona oscura, porque es `absolute inset-0` y tapa el
   * overlay. El test anterior pulsaba el overlay, inalcanzable para una persona, y por eso
   * seguia verde con el manejador roto.
   */
  it('should close when clicking the visible backdrop', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    const backdrop = dialog.firstElementChild as HTMLElement;
    expect(backdrop.className).toContain('absolute');
    expect(backdrop.className).toContain('inset-0');

    backdrop.click();
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
    expect(panel().className).toContain('max-w-modal-md');

    component.size = 'lg';
    await settle(fixture);
    expect(panel().className).toContain('max-w-modal-lg');
    expect(panel().className).not.toContain('max-w-modal-md');

    component.size = 'sm';
    await settle(fixture);
    expect(panel().className).toContain('max-w-modal-sm');
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

  /**
   * Valor computado y no solo la cadena de clase: `max-w-lg` existia como clase y los
   * tests pasaban, pero compilaba a `var(--spacing-lg)` y el panel medio media 48px de
   * ancho. Aqui se mide el CSS que el navegador aplica de verdad.
   */
  it('should resolve the panel max-width to a real container width, not a spacing value', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const panel = () => fixture.nativeElement.querySelector('[cdktrapfocus]') as HTMLElement;

    expect(getComputedStyle(panel()).maxWidth).toBe('512px');

    component.size = 'sm';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(getComputedStyle(panel()).maxWidth).toBe('384px');

    component.size = 'lg';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(getComputedStyle(panel()).maxWidth).toBe('672px');
  });

  // --- Nombre accesible del dialogo ---

  it('should name the dialog with aria-labelledby pointing at its heading', () => {
    component.isOpen = true;
    component.title = 'Mi titulo';
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;

    expect(heading.id).toBeTruthy();
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('should not emit an empty accessible name when there is no title', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');

    expect(dialog.getAttribute('aria-label')).toBeNull();
    expect(dialog.getAttribute('aria-labelledby')).toBeNull();
  });

  // --- Boton de cierre: tipo explicito y area tactil ---

  it('should render the close button as type=button with a 44px touch target', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector(
      '[aria-label="Cerrar"]',
    ) as HTMLButtonElement;

    // Sin `type` explicito el boton es `submit` y enviaba el formulario que lo contuviera.
    expect(closeBtn.type).toBe('button');
    expect(closeBtn.offsetHeight).toBeGreaterThanOrEqual(44);
    expect(closeBtn.offsetWidth).toBeGreaterThanOrEqual(44);
    expect(closeBtn.className).toContain('focus-visible:outline-2');
    expect(closeBtn.className).toContain('focus-visible:outline-offset-2');
    expect(closeBtn.className).toContain('focus-visible:outline-primary');
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
    (dialog.firstElementChild as HTMLElement).click();
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
    expect(dialog.contains(document.activeElement)).toBeTrue();
    expect(document.activeElement).not.toBe(opener);
  });

  /**
   * Escenario «Focus trap»: con el modal abierto, tabular no saca el foco del dialogo.
   *
   * La pulsacion real del tabulador no se puede simular desde Karma: un `KeyboardEvent`
   * sintetico no mueve el foco, eso lo hace el navegador por su cuenta. Lo que si se
   * puede ejercitar es el mecanismo del que depende la trampa: el CDK coloca un ancla
   * enfocable justo detras del panel, que es donde aterriza el foco al tabular desde el
   * ultimo elemento enfocable, y al recibirlo lo devuelve al primero del panel. Enfocar
   * esa ancla es el equivalente observable de ese tabulador.
   */
  it('should send focus back into the panel when it leaves past the last focusable element', async () => {
    fixture.detectChanges();
    component.isOpen = true;
    component.title = 'Confirmar pedido';
    await settle(fixture);

    const panel = fixture.nativeElement.querySelector('[cdktrapfocus]') as HTMLElement;
    const anchors = fixture.nativeElement.querySelectorAll(
      '.cdk-focus-trap-anchor',
    ) as NodeListOf<HTMLElement>;
    expect(anchors.length).toBe(2);

    const footerButton = fixture.nativeElement.querySelector('#footer-btn') as HTMLButtonElement;
    footerButton.focus();
    expect(panel.contains(document.activeElement)).toBeTrue();

    // Tabular desde el ultimo elemento enfocable lleva el foco al ancla final.
    anchors[1].focus();
    await fixture.whenStable();

    expect(panel.contains(document.activeElement)).toBeTrue();
    expect(document.activeElement).not.toBe(anchors[1]);
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
