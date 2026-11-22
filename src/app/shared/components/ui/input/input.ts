import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { UiIdService } from '../../../../core/services/ui-id/ui-id.service';
import {
  FIELD_BASE_CLASSES,
  FIELD_BORDER_CLASSES,
  InputType,
} from '../../../consts/components/input/input.const';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  id = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');
  value = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);

  valueChange = output<string>();

  /** Id de respaldo, generado por el inyector para que sea identico en servidor y en cliente (D-7). */
  private readonly autoId = inject(UiIdService).next('app-input');

  /** Id real del control: el recibido o, si no llega ninguno, uno estable generado aqui. */
  readonly fieldId = computed(() => this.id() || this.autoId);

  /** Id del mensaje de error o de ayuda, para asociarlo al control. */
  readonly messageId = computed(() => `${this.fieldId()}-message`);

  /** `aria-describedby` solo cuando hay mensaje que describir. */
  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId() : null));

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  /** Nodo `3:1550` del frame «WEB Contacto»: ver `field.const.ts`. */
  readonly inputClasses = computed(
    () => `${FIELD_BASE_CLASSES} text-on-surface ${FIELD_BORDER_CLASSES[this.error() ? 'error' : 'default']}`,
  );
}
