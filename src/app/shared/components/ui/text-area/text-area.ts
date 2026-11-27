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
} from '../../../consts/components/input/input.const';

@Component({
  selector: 'app-text-area',
  imports: [],
  templateUrl: './text-area.html',
  styleUrl: './text-area.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextArea {
  id = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  value = input<string>('');
  error = input<string>('');
  hint = input<string>('');
  rows = input<number>(4);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  maxLength = input<number | null>(null);

  valueChange = output<string>();

  /** Id de respaldo, generado por el inyector para que sea identico en servidor y en cliente (D-7). */
  private readonly autoId = inject(UiIdService).next('app-text-area');

  readonly fieldId = computed(() => this.id() || this.autoId);

  readonly messageId = computed(() => `${this.fieldId()}-message`);

  readonly describedBy = computed(() => (this.error() || this.hint() ? this.messageId() : null));

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }

  /**
   * Nodo `3:1578`: mismo contrato visual que el campo de texto, con mas aire por abajo
   * (`pb-sm`, 16px) que es lo que da la altura extra del area de texto en el diseno.
   */
  readonly inputClasses = computed(
    () =>
      `${FIELD_BASE_CLASSES} text-on-surface pb-sm resize-y ${FIELD_BORDER_CLASSES[this.error() ? 'error' : 'default']}`,
  );

  readonly currentLength = computed(() => {
    return this.value()?.length ?? 0;
  });
}
