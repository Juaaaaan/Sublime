import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { UiIdService } from '../../../../core/services/ui-id/ui-id.service';
import { RadioOption } from '../../../models/ui/radio-group.model';
import {
  RADIO_GROUP_NEXT_KEYS,
  RADIO_GROUP_PREVIOUS_KEYS,
  RadioGroupOrientation,
} from '../../../consts/components/radio-group/radio-group.const';

@Component({
  selector: 'app-radio-group',
  imports: [],
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroup {
  /**
   * `name` por defecto del grupo. Lo genera un servicio del inyector y no un contador de
   * modulo: el inyector se recrea en cada bootstrap, asi que el identificador es el mismo
   * en el prerender y en la hidratacion aunque se rendericen varias rutas seguidas en el
   * mismo proceso (decision D-7).
   */
  private readonly uid = inject(UiIdService).next('radio-group');

  label = input<string>('');
  options = input<RadioOption[]>([]);
  value = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  orientation = input<RadioGroupOrientation>('vertical');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  name = input<string>(this.uid);

  valueChange = output<string>();

  /** Id del texto de la etiqueta, para asociarlo al grupo con `aria-labelledby`. */
  readonly labelId = `${this.uid}-label`;
  /** Id del mensaje de error o de la pista, para `aria-describedby`. */
  readonly descriptionId = `${this.uid}-description`;

  private readonly radioInputs = viewChildren<ElementRef<HTMLInputElement>>('radioInput');

  readonly groupClasses = computed(() =>
    this.orientation() === 'horizontal' ? 'flex flex-wrap gap-md' : 'flex flex-col gap-sm',
  );

  /**
   * Las opciones ya resueltas para la plantilla: `disabled` y `selected` se derivan aqui
   * con `computed()` y no con metodos llamados desde el marcado, que se reevaluarian en
   * cada ciclo de deteccion.
   */
  readonly renderOptions = computed(() =>
    this.options().map((option) => ({
      option,
      disabled: this.disabled() || (option.disabled ?? false),
      selected: this.value() === option.value,
    })),
  );

  /** Opciones navegables por teclado: las deshabilitadas se saltan, como un grupo nativo. */
  private readonly enabledOptions = computed(() =>
    this.renderOptions()
      .filter((entry) => !entry.disabled)
      .map((entry) => entry.option),
  );

  onChange(value: string): void {
    this.valueChange.emit(value);
  }

  /**
   * Seleccion con las flechas del teclado. Los radios nativos ya lo hacen por su cuenta,
   * pero estan en `sr-only` dentro de un `role="radiogroup"` propio, asi que el movimiento
   * se implementa aqui para que el foco y el valor emitido sean los mismos en los dos casos.
   */
  onKeydown(event: KeyboardEvent): void {
    const forward = RADIO_GROUP_NEXT_KEYS.includes(event.key);
    const backward = RADIO_GROUP_PREVIOUS_KEYS.includes(event.key);
    if (!forward && !backward) return;

    const options = this.enabledOptions();
    if (this.disabled() || options.length === 0) return;

    event.preventDefault();

    const current = options.findIndex((option) => option.value === this.value());
    const next =
      current === -1
        ? options[forward ? 0 : options.length - 1]
        : options[(current + (forward ? 1 : -1) + options.length) % options.length];

    this.valueChange.emit(next.value);
    this.focusOption(next.value);
  }

  private focusOption(optionValue: string): void {
    const index = this.options().findIndex((option) => option.value === optionValue);
    this.radioInputs()[index]?.nativeElement.focus();
  }
}
