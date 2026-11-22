import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextArea } from './text-area';

describe('TextArea', () => {
  let component: TextArea;
  let fixture: ComponentFixture<TextArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextArea],
    }).compileComponents();

    fixture = TestBed.createComponent(TextArea);
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

    it('should default placeholder to ""', () => {
      expect(component.placeholder()).toBe('');
    });

    it('should default value to ""', () => {
      expect(component.value()).toBe('');
    });

    it('should default error to ""', () => {
      expect(component.error()).toBe('');
    });

    it('should default hint to ""', () => {
      expect(component.hint()).toBe('');
    });

    it('should default rows to 4', () => {
      expect(component.rows()).toBe(4);
    });

    it('should default disabled to false', () => {
      expect(component.disabled()).toBeFalse();
    });

    it('should default required to false', () => {
      expect(component.required()).toBeFalse();
    });

    it('should default maxLength to null', () => {
      expect(component.maxLength()).toBeNull();
    });
  });

  // Escenario del spec: «Default field» y «Placeholder styling» (nodo 3:1578).
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
      expect(classes).toContain('disabled:pointer-events-none');
    });

    it('should add the extra bottom padding of the design', () => {
      expect(component.inputClasses()).toContain('pb-sm');
    });

    it('should style the placeholder with the placeholder token', () => {
      expect(component.inputClasses()).toContain('placeholder:text-placeholder');
    });

    it('should use the field border colour when there is no error', () => {
      const classes = component.inputClasses();
      expect(classes).toContain('border-outline');
      expect(classes).toContain('focus:border-primary');
    });

    it('should use the error border colour when error is set', () => {
      fixture.componentRef.setInput('error', 'Required field');
      const classes = component.inputClasses();
      expect(classes).toContain('border-error');
      expect(classes).toContain('focus:border-error');
      expect(classes).not.toContain('border-outline');
    });
  });

  // Escenario del spec: «Change detection strategy» del requisito de OnPush.
  describe('label styling', () => {
    it('should render the label above the control with the label scale', () => {
      fixture.componentRef.setInput('label', 'Message');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(label.className).toContain('text-label-sm');
      expect(label.className).toContain('uppercase');
      expect(label.className).toContain('tracking-label');
      expect(
        label.compareDocumentPosition(textareaEl) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe('currentLength', () => {
    it('should be 0 when value is empty', () => {
      expect(component.currentLength()).toBe(0);
    });

    it('should be 0 when value is null', () => {
      fixture.componentRef.setInput('value', null);
      expect(component.currentLength()).toBe(0);
    });

    it('should reflect the length of the value', () => {
      fixture.componentRef.setInput('value', 'hello');
      expect(component.currentLength()).toBe(5);
    });

    it('should update when value changes', () => {
      fixture.componentRef.setInput('value', 'abc');
      expect(component.currentLength()).toBe(3);
      fixture.componentRef.setInput('value', 'abcdef');
      expect(component.currentLength()).toBe(6);
    });
  });

  describe('template — label', () => {
    it('should not render label when label input is empty', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });

    it('should render label when label input is set', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Description');
    });

    it('should associate label with textarea via for/id', () => {
      fixture.componentRef.setInput('id', 'description-field');
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label.getAttribute('for')).toBe('description-field');
    });

    it('should show required asterisk when label and required are set', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('label span');
      expect(asterisk).not.toBeNull();
      expect(asterisk.textContent.trim()).toBe('*');
      expect(asterisk.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not show required asterisk when required is false', () => {
      fixture.componentRef.setInput('label', 'Description');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label span')).toBeNull();
    });
  });

  describe('template — textarea element', () => {
    it('should bind value attribute', () => {
      fixture.componentRef.setInput('value', 'Initial content');
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.value).toBe('Initial content');
    });

    it('should bind placeholder attribute', () => {
      fixture.componentRef.setInput('placeholder', 'Write your message');
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.placeholder).toBe('Write your message');
    });

    it('should bind rows attribute', () => {
      fixture.componentRef.setInput('rows', 8);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.rows).toBe(8);
    });

    it('should default rows to 4 in the DOM', () => {
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.rows).toBe(4);
    });

    it('should bind disabled attribute', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.disabled).toBeTrue();
    });

    it('should bind required attribute', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.required).toBeTrue();
    });

    it('should bind maxlength attribute when set', () => {
      fixture.componentRef.setInput('maxLength', 200);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.getAttribute('maxlength')).toBe('200');
    });

    it('should not set maxlength attribute when null', () => {
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.getAttribute('maxlength')).toBeNull();
    });

    it('should apply computed inputClasses', () => {
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.className).toContain('bg-surface-container-lowest');
      expect(textareaEl.className).toContain('border-outline');
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
      fixture.componentRef.setInput('hint', 'Up to 500 characters');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).toBeNull();
      expect(nativeEl.textContent).toContain('Up to 500 characters');
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
    });
  });

  describe('template — character counter', () => {
    it('should not render counter when maxLength is null', () => {
      fixture.componentRef.setInput('value', 'hello');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.textContent).not.toContain('/');
    });

    it('should render counter when maxLength is set', () => {
      fixture.componentRef.setInput('value', 'hello');
      fixture.componentRef.setInput('maxLength', 100);
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.textContent).toContain('5 / 100');
    });

    it('should show 0 / maxLength when value is empty', () => {
      fixture.componentRef.setInput('maxLength', 100);
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.textContent).toContain('0 / 100');
    });

    it('should update counter when value changes', () => {
      fixture.componentRef.setInput('value', 'hi');
      fixture.componentRef.setInput('maxLength', 50);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('2 / 50');

      fixture.componentRef.setInput('value', 'hello world');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('11 / 50');
    });
  });

  describe('onInput', () => {
    it('should emit valueChange with the current textarea value', () => {
      const spy = jasmine.createSpy('valueChange');
      component.valueChange.subscribe(spy);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      textareaEl.value = 'Some long description';
      textareaEl.dispatchEvent(new Event('input'));
      expect(spy).toHaveBeenCalledWith('Some long description');
    });

    it('should emit empty string when textarea is cleared', () => {
      const spy = jasmine.createSpy('valueChange');
      component.valueChange.subscribe(spy);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      textareaEl.value = '';
      textareaEl.dispatchEvent(new Event('input'));
      expect(spy).toHaveBeenCalledWith('');
    });
  });

  // Escenario del spec: «Field in error».
  describe('accessibility — error state', () => {
    it('should mark the control invalid and link the error message', () => {
      fixture.componentRef.setInput('id', 'message-field');
      fixture.componentRef.setInput('error', 'Tell us more');
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      const errorEl: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(textareaEl.getAttribute('aria-invalid')).toBe('true');
      expect(textareaEl.getAttribute('aria-describedby')).toBe(errorEl.id);
      expect(errorEl.id).toBe('message-field-message');
      expect(errorEl.className).toContain('text-error');
    });

    it('should not mark the control invalid when there is no error', () => {
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.getAttribute('aria-invalid')).toBeNull();
      expect(textareaEl.getAttribute('aria-describedby')).toBeNull();
    });

    it('should link the hint to the control when there is no error', () => {
      fixture.componentRef.setInput('id', 'message-field');
      fixture.componentRef.setInput('hint', 'Up to 500 characters');
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.getAttribute('aria-describedby')).toBe('message-field-message');
    });
  });

  // Escenario del spec: «Required field».
  describe('accessibility — required state', () => {
    it('should expose required to assistive technology and mark it visually', () => {
      fixture.componentRef.setInput('label', 'Message');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      const marker: HTMLElement = fixture.nativeElement.querySelector('label span');
      expect(textareaEl.required).toBeTrue();
      expect(textareaEl.getAttribute('aria-required')).toBe('true');
      expect(marker.textContent?.trim()).toBe('*');
      expect(marker.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not expose aria-required when the field is optional', () => {
      fixture.detectChanges();
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.getAttribute('aria-required')).toBeNull();
    });
  });

  // Escenario del spec: «Label is associated».
  describe('accessibility — label association', () => {
    it('should move focus to the control when the label is activated', () => {
      fixture.componentRef.setInput('id', 'message-field');
      fixture.componentRef.setInput('label', 'Message');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(label.getAttribute('for')).toBe(textareaEl.id);
      label.click();
      expect(document.activeElement).toBe(textareaEl);
    });

    it('should fall back to a generated id so the label stays associated', () => {
      fixture.componentRef.setInput('label', 'Message');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const textareaEl: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
      expect(textareaEl.id).toMatch(/^app-text-area-\d+$/);
      expect(label.getAttribute('for')).toBe(textareaEl.id);
    });
  });

  // Escenario del spec: «Class strings react to input changes» — OnPush + signals. Sin
  // `detectChanges()`: solo se espera a que el fixture se estabilice, que es lo que
  // distingue una senal de un getter bajo zoneless + OnPush.
  describe('change detection', () => {
    it('should update the rendered border when the error input changes', async () => {
      const textareaEl = () =>
        fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      await fixture.whenStable();
      expect(textareaEl().className).toContain('border-outline');

      fixture.componentRef.setInput('error', 'Tell us more');
      await fixture.whenStable();

      expect(textareaEl().className).toContain('border-error');
      expect(textareaEl().className).not.toContain('border-outline');
    });
  });
});
