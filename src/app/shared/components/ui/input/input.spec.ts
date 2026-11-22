import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputComponent } from './input';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default inputs', () => {
    it('should default id to ""', () => {
      expect(component.id()).toBe('');
    });

    it('should default label to ""', () => {
      expect(component.label()).toBe('');
    });

    it('should default type to "text"', () => {
      expect(component.type()).toBe('text');
    });

    it('should default value to ""', () => {
      expect(component.value()).toBe('');
    });

    it('should default disabled to false', () => {
      expect(component.disabled()).toBeFalse();
    });

    it('should default required to false', () => {
      expect(component.required()).toBeFalse();
    });

    it('should default error to ""', () => {
      expect(component.error()).toBe('');
    });

    it('should default hint to ""', () => {
      expect(component.hint()).toBe('');
    });
  });

  // Escenario del spec: «Default field» y «Placeholder styling» (nodo 3:1550).
  describe('inputClasses', () => {
    it('should render the shared field contract', () => {
      const classes = component.inputClasses();
      expect(classes).toContain('w-full');
      expect(classes).toContain('bg-surface-container-lowest');
      expect(classes).toContain('rounded-field');
      expect(classes).toContain('px-field-x');
      expect(classes).toContain('py-field-y');
      expect(classes).toContain('text-body-sm');
      expect(classes).toContain('transition-colors');
      expect(classes).toContain('duration-300');
      expect(classes).toContain('disabled:opacity-40');
    });

    it('should style the placeholder with the placeholder token', () => {
      expect(component.inputClasses()).toContain('placeholder:text-placeholder');
    });

    it('should use the field border colour when there is no error', () => {
      const classes = component.inputClasses();
      expect(classes).toContain('border-outline-field');
      expect(classes).toContain('focus:border-primary');
    });

    it('should use the error border colour when error is set', () => {
      fixture.componentRef.setInput('error', 'Required field');
      const classes = component.inputClasses();
      expect(classes).toContain('border-error');
      expect(classes).toContain('focus:border-error');
      expect(classes).not.toContain('border-outline-field');
    });

    it('should apply the computed classes to the rendered input', () => {
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.className).toContain('bg-surface-container-lowest');
      expect(inputEl.className).toContain('border-outline-field');
    });
  });

  // Escenario del spec: «Default field» — etiqueta encima con el estilo de 12px.
  describe('label styling', () => {
    it('should render the label above the control with the label scale', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(label.className).toContain('text-label-sm');
      expect(label.className).toContain('uppercase');
      expect(label.className).toContain('tracking-label');
      expect(label.compareDocumentPosition(inputEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  describe('template — label', () => {
    it('should not render label when label input is empty', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });

    it('should render label when label input is set', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Email');
    });

    it('should associate label with input via for/id', () => {
      fixture.componentRef.setInput('id', 'email-field');
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label.getAttribute('for')).toBe('email-field');
    });

    it('should show required asterisk when label and required are set', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('label span');
      expect(asterisk).not.toBeNull();
      expect(asterisk.textContent.trim()).toBe('*');
    });

    it('should not show required asterisk when required is false', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label span')).toBeNull();
    });
  });

  describe('template — input element', () => {
    it('should bind type attribute', () => {
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.type).toBe('email');
    });

    it('should bind placeholder attribute', () => {
      fixture.componentRef.setInput('placeholder', 'Enter your email');
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.placeholder).toBe('Enter your email');
    });

    it('should bind disabled attribute', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input').disabled).toBeTrue();
    });

    it('should bind required attribute', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('input').required).toBeTrue();
    });
  });

  describe('template — error and hint', () => {
    it('should render error message with role="alert" when error is set', () => {
      fixture.componentRef.setInput('error', 'This field is required');
      fixture.detectChanges();
      const errorEl: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(errorEl).not.toBeNull();
      expect(errorEl.textContent?.trim()).toBe('This field is required');
    });

    it('should render hint when hint is set and no error', () => {
      fixture.componentRef.setInput('hint', 'Use a valid email address');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).toBeNull();
      expect(nativeEl.textContent).toContain('Use a valid email address');
    });

    it('should show error and hide hint when both are set', () => {
      fixture.componentRef.setInput('error', 'Invalid value');
      fixture.componentRef.setInput('hint', 'Some helpful hint');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).not.toBeNull();
      expect(nativeEl.textContent).not.toContain('Some helpful hint');
    });

    it('should show neither error nor hint when both are empty', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('span').length).toBe(0);
    });
  });

  describe('onInput', () => {
    it('should emit valueChange with the current input value', () => {
      const spy = jasmine.createSpy('valueChange');
      component.valueChange.subscribe(spy);
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      inputEl.value = 'hello@example.com';
      inputEl.dispatchEvent(new Event('input'));
      expect(spy).toHaveBeenCalledWith('hello@example.com');
    });
  });

  // Escenario del spec: «Field in error».
  describe('accessibility — error state', () => {
    it('should mark the control invalid and link the error message', () => {
      fixture.componentRef.setInput('id', 'email-field');
      fixture.componentRef.setInput('error', 'Invalid email');
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const errorEl: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(inputEl.getAttribute('aria-invalid')).toBe('true');
      expect(inputEl.getAttribute('aria-describedby')).toBe(errorEl.id);
      expect(errorEl.id).toBe('email-field-message');
      expect(errorEl.className).toContain('text-error');
    });

    it('should not mark the control invalid when there is no error', () => {
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.getAttribute('aria-invalid')).toBeNull();
      expect(inputEl.getAttribute('aria-describedby')).toBeNull();
    });

    it('should link the hint to the control when there is no error', () => {
      fixture.componentRef.setInput('id', 'email-field');
      fixture.componentRef.setInput('hint', 'We never share it');
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const hintEl: HTMLElement = fixture.nativeElement.querySelector('#email-field-message');
      expect(inputEl.getAttribute('aria-describedby')).toBe('email-field-message');
      expect(hintEl.textContent?.trim()).toBe('We never share it');
    });
  });

  // Escenario del spec: «Required field».
  describe('accessibility — required state', () => {
    it('should expose required to assistive technology and mark it visually', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      const marker: HTMLElement = fixture.nativeElement.querySelector('label span');
      expect(inputEl.required).toBeTrue();
      expect(inputEl.getAttribute('aria-required')).toBe('true');
      expect(marker.textContent?.trim()).toBe('*');
      expect(marker.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not expose aria-required when the field is optional', () => {
      fixture.detectChanges();
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.getAttribute('aria-required')).toBeNull();
    });
  });

  // Escenario del spec: «Label is associated».
  describe('accessibility — label association', () => {
    it('should move focus to the control when the label is activated', () => {
      fixture.componentRef.setInput('id', 'email-field');
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(label.getAttribute('for')).toBe(inputEl.id);
      label.click();
      expect(document.activeElement).toBe(inputEl);
    });

    it('should fall back to a generated id so the label stays associated', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
      expect(inputEl.id).toMatch(/^app-input-\d+$/);
      expect(label.getAttribute('for')).toBe(inputEl.id);
    });
  });
});
