import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { TRANSLOCO_CONST_CONFIG } from '../../../../shared/consts/translations/transloco.const';
import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero, TranslocoTestingModule.forRoot(TRANSLOCO_CONST_CONFIG)],
    }).compileComponents();

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the hero texts in the active language', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')!.textContent).toContain('Wearable');
    expect(el.querySelector('h1 em')!.textContent).toBe('ethereal');
    expect(el.querySelector('img')!.getAttribute('alt')).toBe(
      'Handcrafted resin jewelry by Sublime',
    );
    expect(el.textContent).toContain('View collections');
  });

  it('should translate the hero texts when the language changes', async () => {
    TestBed.inject(TranslocoService).setActiveLang('es');
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')!.textContent).toContain('Belleza');
    expect(el.querySelector('img')!.getAttribute('alt')).toBe(
      'Joyería artesanal de resina de Sublime',
    );
    expect(el.textContent).toContain('Ver colecciones');
    expect(el.textContent).toContain('Nuestra historia');
  });
});
