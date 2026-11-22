import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioOption } from '../../../models/ui/radio-group.model';
import { RadioGroup } from './radio-group';

const mockOptions: RadioOption[] = [
  { value: 'uv', label: 'UV Resin' },
  { value: 'epoxy', label: 'Epoxy Resin' },
  { value: 'polyester', label: 'Polyester Resin', disabled: true },
];

const mockOptionsWithDescriptions: RadioOption[] = [
  { value: 'uv', label: 'UV Resin', description: 'Fast curing' },
  { value: 'epoxy', label: 'Epoxy Resin', description: 'Strong finish' },
];

describe('RadioGroup', () => {
  let component: RadioGroup;
  let fixture: ComponentFixture<RadioGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroup);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Tipo de resina');
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label', () => {
    const label = fixture.nativeElement.querySelector('span');
    expect(label.textContent.trim()).toContain('Tipo de resina');
  });

  it('should render all options', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs.length).toBe(3);
  });

  it('should emit valueChange when option selected', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs[0].dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith('uv');
  });

  it('should mark option as checked when value matches', () => {
    fixture.componentRef.setInput('value', 'epoxy');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[1].checked).toBeTrue();
  });

  it('should disable individual option when option.disabled is true', () => {
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(inputs[2].disabled).toBeTrue();
  });

  it('should disable all options when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input: HTMLInputElement) => {
      expect(input.disabled).toBeTrue();
    });
  });

  it('should show required indicator when required', () => {
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const indicator = fixture.nativeElement.querySelector('[aria-hidden="true"]');
    expect(indicator).toBeTruthy();
  });

  it('should show error message when error is set', () => {
    fixture.componentRef.setInput('error', 'Selecciona un tipo');
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent.trim()).toBe('Selecciona un tipo');
  });

  it('should render descriptions when provided', () => {
    fixture.componentRef.setInput('options', mockOptionsWithDescriptions);
    fixture.detectChanges();
    const descriptions = fixture.nativeElement.querySelectorAll('.mt-xs');
    expect(descriptions.length).toBe(2);
  });

  it('should apply horizontal layout when orientation is horizontal', () => {
    fixture.componentRef.setInput('orientation', 'horizontal');
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group.className).toContain('flex-wrap');
  });

  it('should not render label when label is empty', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    // No se consulta por clase: `text-label-sm` la comparten la descripcion de
    // opcion, el error y la pista, asi que el selector dejaria de identificar a
    // la etiqueta del grupo. La etiqueta es el hermano anterior al radiogroup.
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group.previousElementSibling).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Tipo de resina');
  });

  it('should not show required indicator when required is false', () => {
    const indicator = fixture.nativeElement.querySelector('[aria-hidden="true"]');
    expect(indicator).toBeNull();
  });

  it('should apply vertical layout by default', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group.className).toContain('flex-col');
  });

  it('should show hint when hint is set and no error', () => {
    fixture.componentRef.setInput('hint', 'Elige el tipo de resina');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Elige el tipo de resina');
  });

  // --- Escenario «Deterministic group name» del spec ---

  it('should give the first group the same name in two independent bootstraps', async () => {
    // El escenario del spec es «el mismo `name` en servidor y en cliente». Resetear el
    // TestBed equivale a un bootstrap nuevo: inyector raiz nuevo, mismo orden de
    // instanciacion. Con el contador en el modulo el segundo arranque seguia contando
    // donde lo dejo el primero (prerender de varias rutas en el mismo proceso) y el
    // `name` no coincidia con el del cliente (decision D-7).
    const nameOfFirstGroup = async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({ imports: [RadioGroup] }).compileComponents();
      const bootstrapped = TestBed.createComponent(RadioGroup);
      bootstrapped.componentRef.setInput('options', mockOptions);
      bootstrapped.detectChanges();
      return (bootstrapped.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement)
        .name;
    };

    const onTheServer = await nameOfFirstGroup();
    const onTheClient = await nameOfFirstGroup();

    expect(onTheServer).toMatch(/^radio-group-\d+$/);
    expect(onTheClient).toBe(onTheServer);
  });

  it('should not reuse the same name for two groups alive at once', () => {
    const first = fixture.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement;

    const second = TestBed.createComponent(RadioGroup);
    second.componentRef.setInput('options', mockOptions);
    second.detectChanges();
    const secondName = (
      second.nativeElement.querySelector('input[type="radio"]') as HTMLInputElement
    ).name;

    expect(secondName).toMatch(/^radio-group-\d+$/);
    expect(secondName).not.toBe(first.name);
  });

  it('should keep the rendered name stable across consecutive renders of the same tree', () => {
    const readNames = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'input[type="radio"]',
        ) as NodeListOf<HTMLInputElement>,
      ).map((input) => input.name);

    const before = readNames();
    fixture.detectChanges();
    fixture.componentRef.setInput('value', 'epoxy');
    fixture.detectChanges();

    expect(readNames()).toEqual(before);
    expect(new Set(before).size).toBe(1);
  });

  it('should let the caller override the group name', () => {
    fixture.componentRef.setInput('name', 'resin-type');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    inputs.forEach((input: HTMLInputElement) => expect(input.name).toBe('resin-type'));
  });

  // --- Escenario «Accessible grouping» del spec ---

  it('should expose the options as a group labelled by its own label', () => {
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    const labelledBy = group.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    const labelEl = fixture.nativeElement.querySelector(`#${labelledBy}`);
    expect(labelEl).toBeTruthy();
    expect(labelEl.textContent.trim()).toContain('Tipo de resina');
  });

  it('should not reference a label element when there is no label', () => {
    fixture.componentRef.setInput('label', '');
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    expect(group.getAttribute('aria-labelledby')).toBeNull();
  });

  it('should associate the error message with the group and mark it invalid', () => {
    fixture.componentRef.setInput('error', 'Selecciona un tipo');
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    const describedBy = group.getAttribute('aria-describedby');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector(`#${describedBy}`).textContent.trim()).toBe(
      'Selecciona un tipo',
    );
  });

  it('should associate the hint with the group when there is no error', () => {
    fixture.componentRef.setInput('hint', 'Elige el tipo de resina');
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role="radiogroup"]');
    const describedBy = group.getAttribute('aria-describedby');
    expect(group.getAttribute('aria-invalid')).toBeNull();
    expect(fixture.nativeElement.querySelector(`#${describedBy}`).textContent.trim()).toBe(
      'Elige el tipo de resina',
    );
  });

  // --- Escenario «Keyboard selection» del spec ---

  it('should select the next enabled option with ArrowDown and ArrowRight', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    fixture.componentRef.setInput('value', 'uv');
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');

    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(spy).toHaveBeenCalledWith('epoxy');

    spy.calls.reset();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(spy).toHaveBeenCalledWith('epoxy');
  });

  it('should skip disabled options and wrap around with ArrowUp', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    fixture.componentRef.setInput('value', 'uv');
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');

    // «polyester» esta deshabilitada, asi que la anterior a «uv» es «epoxy».
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(spy).toHaveBeenCalledWith('epoxy');
  });

  it('should move focus to the option selected with the keyboard', () => {
    fixture.componentRef.setInput('value', 'uv');
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input[type="radio"]');

    inputs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('should select the first enabled option when nothing is selected yet', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');

    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(spy).toHaveBeenCalledWith('uv');

    spy.calls.reset();
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(spy).toHaveBeenCalledWith('epoxy');
  });

  it('should ignore keys other than the arrows', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radios[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('should ignore the arrows when the whole group is disabled', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    // Se invoca el manejador directamente: los radios estan deshabilitados, asi que en
    // uso real no reciben el evento y por el DOM no se alcanzaria esta rama.
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(spy).not.toHaveBeenCalled();
  });

  it('should ignore the arrows when there are no options', () => {
    const spy = jasmine.createSpy('valueChange');
    component.valueChange.subscribe(spy);
    fixture.componentRef.setInput('options', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('input[type="radio"]').length).toBe(0);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(spy).not.toHaveBeenCalled();
  });

  // --- Tokens ---

  it('should style the option label and the group with design tokens', () => {
    const optionLabel = fixture.nativeElement.querySelector(
      'label > span:last-child > span:first-child',
    );
    expect(optionLabel.className).toContain('text-body-sm');
    expect(optionLabel.className).toContain('text-deep-moss');

    const indicator = fixture.nativeElement.querySelector('label > span');
    expect(indicator.className).toContain('border-outline');
    expect(indicator.className).toContain('peer-checked:border-deep-moss');
  });
});
