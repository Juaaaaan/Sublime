import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Select } from './select';
import { SelectOption } from '../../../models/ui/select.model';

/** Clases como tokens: `placeholder:text-placeholder` contiene `text-placeholder`. */
const tokensOf = (classes: string): string[] => classes.split(/\s+/);

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;

  const options: SelectOption[] = [
    { value: 'gold', label: 'Gold Plated' },
    { value: 'silver', label: 'Silver Plated' },
    { value: 'bronze', label: 'Bronze', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select);
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

    // Spec: "Primitives carry no hardcoded UI copy". El placeholder lo aporta quien usa el
    // select, ya traducido por Transloco; antes venia fijo en espanol y se saltaba la i18n.
    it('should carry no placeholder copy of its own', () => {
      expect(component.placeholder()).toBe('');
      expect(fixture.nativeElement.textContent).not.toContain('Selecciona');
    });

    it('should render the placeholder the caller provides', async () => {
      fixture.componentRef.setInput('placeholder', 'Select a reason...');
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Select a reason...');
    });

    it('should default options to []', () => {
      expect(component.options()).toEqual([]);
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

    it('should default disabled to false', () => {
      expect(component.disabled()).toBeFalse();
    });

    it('should default required to false', () => {
      expect(component.required()).toBeFalse();
    });
  });

  // Escenario del spec: «Default field» y «Placeholder styling» (nodo 3:1570).
  describe('selectClasses', () => {
    it('should render the shared field contract', () => {
      const classes = component.selectClasses();
      expect(classes).toContain('w-full');
      expect(classes).toContain('bg-surface-container-lowest');
      expect(classes).toContain('rounded-field');
      expect(classes).toContain('px-field-x');
      expect(classes).toContain('py-field-y');
      expect(classes).toContain('text-body-sm');
      expect(classes).toContain('transition-colors');
      expect(classes).toContain('duration-300');
      expect(classes).toContain('appearance-none');
      expect(classes).toContain('disabled:opacity-40');
    });

    it('should leave room on the right for the chevron', () => {
      expect(component.selectClasses()).toContain('pr-lg');
    });

    it('should use the field border colour when there is no error', () => {
      const classes = component.selectClasses();
      expect(classes).toContain('border-outline');
      expect(classes).toContain('focus:border-primary');
    });

    it('should use the error border colour when error is set', () => {
      fixture.componentRef.setInput('error', 'Required field');
      const classes = component.selectClasses();
      expect(classes).toContain('border-error');
      expect(classes).toContain('focus:border-error');
      expect(classes).not.toContain('border-outline');
    });

    // Escenario «Placeholder styling»: el marcador usa el token de placeholder, el mismo
    // que el campo de texto. `placeholder:text-placeholder` no sirve en un `<select>`
    // (no existe `::placeholder`), asi que el color se aplica al propio control.
    // Se comparan tokens de clase y no subcadenas: la base ya trae
    // `placeholder:text-placeholder`, asi que un `toContain` sobre la cadena acertaria
    // siempre y el test no distinguiria los dos estados.
    it('should render the placeholder text with the placeholder token when there is no value', () => {
      expect(tokensOf(component.selectClasses())).toContain('text-placeholder');
    });

    it('should render the chosen value in the body text colour', () => {
      fixture.componentRef.setInput('value', 'gold');
      const tokens = tokensOf(component.selectClasses());
      expect(tokens).toContain('text-on-surface');
      expect(tokens).not.toContain('text-placeholder');
    });
  });

  // Escenario del spec: «Default field» — chevron a la derecha, decorativo.
  describe('chevron', () => {
    it('should render an inline hairline chevron hidden from assistive technology', () => {
      fixture.detectChanges();
      const chevronWrapper: HTMLElement =
        fixture.nativeElement.querySelector('[aria-hidden="true"]');
      const svg = chevronWrapper.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('stroke')).toBe('currentColor');
      expect(svg?.getAttribute('stroke-width')).toBe('1');
      expect(chevronWrapper.className).toContain('pointer-events-none');
    });
  });

  // Escenario del spec: «Default field» — etiqueta encima con el estilo de 12px.
  describe('label styling', () => {
    it('should render the label above the control with the label scale', () => {
      fixture.componentRef.setInput('label', 'Subject');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(label.className).toContain('text-label-sm');
      expect(label.className).toContain('uppercase');
      expect(label.className).toContain('tracking-label');
      expect(
        label.compareDocumentPosition(selectEl) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe('template — label', () => {
    it('should not render label when label input is empty', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });

    it('should render label when label input is set', () => {
      fixture.componentRef.setInput('label', 'Material');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Material');
    });

    it('should associate label with select via for/id', () => {
      fixture.componentRef.setInput('id', 'material-field');
      fixture.componentRef.setInput('label', 'Material');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      expect(label.getAttribute('for')).toBe('material-field');
    });

    it('should show required asterisk when label and required are set', () => {
      fixture.componentRef.setInput('label', 'Material');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const asterisk = fixture.nativeElement.querySelector('label span');
      expect(asterisk).not.toBeNull();
      expect(asterisk.textContent.trim()).toBe('*');
    });

    it('should not show required asterisk when required is false', () => {
      fixture.componentRef.setInput('label', 'Material');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('label span')).toBeNull();
    });
  });

  describe('template — select element', () => {
    it('should bind disabled attribute', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.disabled).toBeTrue();
    });

    it('should bind required attribute', () => {
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.required).toBeTrue();
    });

    it('should reflect the current value', () => {
      fixture.componentRef.setInput('options', options);
      fixture.componentRef.setInput('value', 'silver');
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.value).toBe('silver');
    });
  });

  describe('template — placeholder option', () => {
    it('should render placeholder option when placeholder is set', () => {
      fixture.componentRef.setInput('placeholder', 'Pick a finish');
      fixture.detectChanges();
      const placeholderOption: HTMLOptionElement =
        fixture.nativeElement.querySelector('option[value=""]');
      expect(placeholderOption).not.toBeNull();
      expect(placeholderOption.textContent?.trim()).toBe('Pick a finish');
      expect(placeholderOption.disabled).toBeTrue();
    });

    it('should not render placeholder option when placeholder is empty', () => {
      fixture.componentRef.setInput('placeholder', '');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('option[value=""]')).toBeNull();
    });
  });

  describe('template — options', () => {
    it('should render an option per item in options()', () => {
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();
      const optionEls: NodeListOf<HTMLOptionElement> =
        fixture.nativeElement.querySelectorAll('option:not([value=""])');
      expect(optionEls.length).toBe(3);
      expect(optionEls[0].value).toBe('gold');
      expect(optionEls[0].textContent?.trim()).toBe('Gold Plated');
    });

    it('should mark option as disabled when option.disabled is true', () => {
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();
      const bronzeOption: HTMLOptionElement =
        fixture.nativeElement.querySelector('option[value="bronze"]');
      expect(bronzeOption.disabled).toBeTrue();
    });

    it('should not mark option as disabled when option.disabled is undefined', () => {
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();
      const goldOption: HTMLOptionElement =
        fixture.nativeElement.querySelector('option[value="gold"]');
      expect(goldOption.disabled).toBeFalse();
    });

    it('should render no options when options() is empty', () => {
      fixture.detectChanges();
      const optionEls = fixture.nativeElement.querySelectorAll('option:not([value=""])');
      expect(optionEls.length).toBe(0);
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
      fixture.componentRef.setInput('hint', 'Choose carefully');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).toBeNull();
      expect(nativeEl.textContent).toContain('Choose carefully');
    });

    it('should show error and hide hint when both are set', () => {
      fixture.componentRef.setInput('error', 'Invalid selection');
      fixture.componentRef.setInput('hint', 'Some helpful hint');
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).not.toBeNull();
      expect(nativeEl.textContent).not.toContain('Some helpful hint');
    });

    it('should show neither error nor hint when both are empty', () => {
      fixture.detectChanges();
      const nativeEl: HTMLElement = fixture.nativeElement;
      expect(nativeEl.querySelector('[role="alert"]')).toBeNull();
      const messageSpans = nativeEl.querySelectorAll('div > span');
      expect(messageSpans.length).toBe(0);
    });
  });

  describe('onChange', () => {
    it('should emit valueChange with the selected option value', () => {
      const spy = jasmine.createSpy('valueChange');
      component.valueChange.subscribe(spy);
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      selectEl.value = 'silver';
      selectEl.dispatchEvent(new Event('change'));
      expect(spy).toHaveBeenCalledWith('silver');
    });
  });

  // Escenario del spec: «Field in error».
  describe('accessibility — error state', () => {
    it('should mark the control invalid and link the error message', () => {
      fixture.componentRef.setInput('id', 'subject-field');
      fixture.componentRef.setInput('error', 'Pick a subject');
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      const errorEl: HTMLElement = fixture.nativeElement.querySelector('[role="alert"]');
      expect(selectEl.getAttribute('aria-invalid')).toBe('true');
      expect(selectEl.getAttribute('aria-describedby')).toBe(errorEl.id);
      expect(errorEl.id).toBe('subject-field-message');
      expect(errorEl.className).toContain('text-error');
    });

    it('should not mark the control invalid when there is no error', () => {
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.getAttribute('aria-invalid')).toBeNull();
      expect(selectEl.getAttribute('aria-describedby')).toBeNull();
    });

    it('should link the hint to the control when there is no error', () => {
      fixture.componentRef.setInput('id', 'subject-field');
      fixture.componentRef.setInput('hint', 'We answer within two days');
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.getAttribute('aria-describedby')).toBe('subject-field-message');
    });
  });

  // Escenario del spec: «Required field».
  describe('accessibility — required state', () => {
    it('should expose required to assistive technology and mark it visually', () => {
      fixture.componentRef.setInput('label', 'Subject');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      const marker: HTMLElement = fixture.nativeElement.querySelector('label span');
      expect(selectEl.required).toBeTrue();
      expect(selectEl.getAttribute('aria-required')).toBe('true');
      expect(marker.textContent?.trim()).toBe('*');
      expect(marker.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not expose aria-required when the field is optional', () => {
      fixture.detectChanges();
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.getAttribute('aria-required')).toBeNull();
    });
  });

  // Escenario del spec: «Label is associated».
  describe('accessibility — label association', () => {
    it('should move focus to the control when the label is activated', () => {
      fixture.componentRef.setInput('id', 'subject-field');
      fixture.componentRef.setInput('label', 'Subject');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(label.getAttribute('for')).toBe(selectEl.id);
      label.click();
      expect(document.activeElement).toBe(selectEl);
    });

    it('should fall back to a generated id so the label stays associated', () => {
      fixture.componentRef.setInput('label', 'Subject');
      fixture.detectChanges();
      const label: HTMLLabelElement = fixture.nativeElement.querySelector('label');
      const selectEl: HTMLSelectElement = fixture.nativeElement.querySelector('select');
      expect(selectEl.id).toMatch(/^app-select-\d+$/);
      expect(label.getAttribute('for')).toBe(selectEl.id);
    });
  });

  // Escenario del spec: «Class strings react to input changes» — computed() en lugar de
  // getter. Aqui no se llama a `detectChanges()`: solo se espera a que el fixture se
  // estabilice, que es lo que distingue una senal de un getter bajo zoneless + OnPush.
  describe('change detection', () => {
    it('should update the rendered border when the error input changes', async () => {
      const selectEl = () => fixture.nativeElement.querySelector('select') as HTMLSelectElement;
      await fixture.whenStable();
      expect(selectEl().className).toContain('border-outline');

      fixture.componentRef.setInput('error', 'Pick a subject');
      await fixture.whenStable();

      expect(selectEl().className).toContain('border-error');
      expect(selectEl().className).not.toContain('border-outline');
    });

    it('should update the rendered text colour when the value arrives', async () => {
      const tokens = () =>
        tokensOf((fixture.nativeElement.querySelector('select') as HTMLSelectElement).className);
      await fixture.whenStable();
      expect(tokens()).toContain('text-placeholder');

      fixture.componentRef.setInput('value', 'gold');
      await fixture.whenStable();

      expect(tokens()).toContain('text-on-surface');
      expect(tokens()).not.toContain('text-placeholder');
    });
  });
});
