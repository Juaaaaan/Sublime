import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';

const SHARE_IMAGE_PATH = '/images/home/rc-hero-background.png';
const OG_LOCALES: Record<string, string> = { es: 'es_ES', en: 'en_US' };

interface PageSeo {
  path: string;
  key: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** Mantiene título, metadatos, canónica e idioma al día en cada navegación. */
  init(): void {
    this.transloco.langChanges$.subscribe((lang) => {
      this.document.documentElement.lang = lang;
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => this.pageFrom(event.urlAfterRedirects)),
        filter((page): page is PageSeo => page !== null),
        switchMap(({ path, key }) =>
          combineLatest([
            this.transloco.selectTranslate<string>(`seo.${key}.title`),
            this.transloco.selectTranslate<string>(`seo.${key}.description`),
          ]).pipe(map(([title, description]) => ({ path, title, description }))),
        ),
      )
      .subscribe(({ path, title, description }) => this.apply(path, title, description));
  }

  private pageFrom(url: string): PageSeo | null {
    let route: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const key = route.data['seo'] as string | undefined;
    return key ? { key, path: url.split(/[?#]/)[0] } : null;
  }

  private apply(path: string, title: string, description: string): void {
    const url = `${environment.appUrl}${path}`;
    const image = `${environment.appUrl}${SHARE_IMAGE_PATH}`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Sublime' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({
      property: 'og:locale',
      content: OG_LOCALES[this.transloco.getActiveLang()] ?? OG_LOCALES['es'],
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
