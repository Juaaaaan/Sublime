#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guardia de la capa de tokens.
 *
 * Tailwind v4 no falla cuando una plantilla usa una utilidad que no existe: simplemente
 * no emite CSS. El estilo se pierde en silencio y los tests siguen en verde. Este change
 * nació de 53 usos de clases en esa situación (`font-label-sm` x35, `font-body-md` x8,
 * `font-h3` x2, `shadow-soft` x2, `mb-mb` x4, `pb-base`, `text-h4`, `ont-light`).
 *
 * Alcance deliberado: esto comprueba que cada clase **emite CSS**, no que respete el
 * design system. Utilidades nativas de Tailwind que sí emiten CSS (`p-8`, `text-sm`,
 * `bg-white`) pasan aunque DESIGN.md prefiera un token nombrado; eso es trabajo de la
 * revisión de diseño de cada página, no de una puerta automática.
 *
 * Prefijos cubiertos: los de TOKEN_NAMESPACES. Quedan fuera a propósito `w-`, `h-`,
 * `inset-`, `top-/right-/bottom-/left-`, `translate-`, `ring-` y `divide-`, porque
 * admiten fracciones, porcentajes y palabras clave (`w-1/2`, `h-screen`, `inset-auto`)
 * que darian falsos positivos constantes. Si un bug aparece ahi, se anade el prefijo
 * con su lista de nativas.
 *
 * Va como script de Node y no como spec de Karma porque los tests corren en navegador,
 * sin acceso al sistema de ficheros: un spec no puede leer `src/tailwind.css`. Se engancha
 * en `npm run lint:tokens`, que entra en el pre-commit junto a lint y cobertura.
 */

const SRC_APP = 'src/app';
const TAILWIND_CSS = 'src/tailwind.css';

/** Prefijos cuyo sufijo tiene que corresponder a un token de `@theme`. */
const TOKEN_NAMESPACES = [
  { prefix: 'text-', namespaces: ['--text-', '--color-'] },
  { prefix: 'tracking-', namespaces: ['--tracking-'] },
  { prefix: 'font-', namespaces: ['--font-'] },
  { prefix: 'shadow-', namespaces: ['--shadow-'] },
  { prefix: 'rounded-', namespaces: ['--radius-'] },
  { prefix: 'p-', namespaces: ['--spacing-'] },
  { prefix: 'px-', namespaces: ['--spacing-'] },
  { prefix: 'py-', namespaces: ['--spacing-'] },
  { prefix: 'pt-', namespaces: ['--spacing-'] },
  { prefix: 'pr-', namespaces: ['--spacing-'] },
  { prefix: 'pb-', namespaces: ['--spacing-'] },
  { prefix: 'pl-', namespaces: ['--spacing-'] },
  { prefix: 'm-', namespaces: ['--spacing-'] },
  { prefix: 'mx-', namespaces: ['--spacing-'] },
  { prefix: 'my-', namespaces: ['--spacing-'] },
  { prefix: 'mt-', namespaces: ['--spacing-'] },
  { prefix: 'mr-', namespaces: ['--spacing-'] },
  { prefix: 'mb-', namespaces: ['--spacing-'] },
  { prefix: 'ml-', namespaces: ['--spacing-'] },
  { prefix: 'gap-', namespaces: ['--spacing-'] },
  { prefix: 'gap-x-', namespaces: ['--spacing-'] },
  { prefix: 'gap-y-', namespaces: ['--spacing-'] },
  { prefix: 'space-x-', namespaces: ['--spacing-'] },
  { prefix: 'space-y-', namespaces: ['--spacing-'] },
  { prefix: 'leading-', namespaces: ['--leading-'] },
  { prefix: 'outline-', namespaces: ['--color-'] },
  { prefix: 'accent-', namespaces: ['--color-'] },
  { prefix: 'caret-', namespaces: ['--color-'] },
  { prefix: 'fill-', namespaces: ['--color-'] },
  { prefix: 'stroke-', namespaces: ['--color-'] },
  { prefix: 'decoration-', namespaces: ['--color-'] },
  { prefix: 'from-', namespaces: ['--color-'] },
  { prefix: 'via-', namespaces: ['--color-'] },
  { prefix: 'to-', namespaces: ['--color-'] },
  { prefix: 'drop-shadow-', namespaces: ['--drop-shadow-'] },
];

/**
 * Utilidades nativas de Tailwind con estos prefijos: emiten CSS sin token del proyecto.
 * La lista es explícita a propósito: así una clase nueva se revisa al añadirla.
 */
const NATIVE_UTILITIES = new Set([
  // pesos y estilo de fuente
  'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium',
  'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
  // escala nativa de texto
  'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
  'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
  // alineacion y tratamiento de texto
  'text-left', 'text-center', 'text-right', 'text-justify', 'text-start', 'text-end',
  'text-wrap', 'text-nowrap', 'text-balance', 'text-pretty', 'text-ellipsis', 'text-clip',
  // colores nativos que el proyecto sigue usando
  'text-white', 'text-black', 'text-transparent', 'text-current', 'text-inherit',
  'bg-white', 'bg-black', 'bg-transparent', 'bg-current', 'bg-inherit',
  'border-white', 'border-black', 'border-transparent', 'border-current', 'border-inherit',
  // tracking nativo
  'tracking-tighter', 'tracking-tight', 'tracking-normal', 'tracking-wide',
  'tracking-wider', 'tracking-widest',
  // radios nativos
  'rounded-none', 'rounded-xs', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl',
  'rounded-2xl', 'rounded-3xl', 'rounded-full',
  // sombras nativas
  'shadow-none', 'shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
  'shadow-inner',
  // anchos de contenedor nativos
  'max-w-none', 'max-w-full', 'max-w-min', 'max-w-max', 'max-w-fit', 'max-w-prose',
  'max-w-screen-sm', 'max-w-screen-md', 'max-w-screen-lg', 'max-w-screen-xl',
  // Ojo: max-w-xs..7xl NO van aqui. Existen en el tema por defecto, pero --spacing-* los
  // ensombrece, asi que necesitan pasar por la comprobacion de ambiguedad.
  // bordes nativos: ancho, no color
  'border-0', 'border-2', 'border-4', 'border-8',
  // outline: grosor, estilo y offset son nativos; solo el color necesita token
  'outline-none', 'outline-hidden', 'outline-solid', 'outline-dashed', 'outline-dotted',
  'outline-double', 'outline-offset-0', 'outline-offset-1', 'outline-offset-2',
  'outline-offset-4', 'outline-offset-8',
  'fill-none', 'fill-current', 'stroke-none', 'stroke-current',
  'decoration-solid', 'decoration-dashed', 'decoration-dotted', 'decoration-double',
  'decoration-wavy', 'decoration-from-font', 'decoration-auto',
  'to-transparent', 'from-transparent', 'via-transparent',
  // interlineado nativo
  'leading-none', 'leading-tight', 'leading-snug', 'leading-normal', 'leading-relaxed',
  'leading-loose',
  // drop-shadow nativo
  'drop-shadow-none', 'drop-shadow-xs', 'drop-shadow-sm', 'drop-shadow-md', 'drop-shadow-lg',
  'drop-shadow-xl', 'drop-shadow-2xl',
  // margen automatico
  'm-auto', 'mx-auto', 'my-auto', 'mt-auto', 'mr-auto', 'mb-auto', 'ml-auto',
]);

/**
 * Clases que SÍ emiten CSS pero están prohibidas en este proyecto.
 *
 * Tailwind v4 trae `--font-serif` y `--font-mono` en su tema por defecto, así que borrar
 * el token del proyecto no basta: `font-serif` seguía renderizando en Georgia. El `@theme`
 * las cierra con `initial`, y esta lista impide que vuelvan a escribirse.
 */
/** Contenedores del tema por defecto de Tailwind v4, que emiten CSS sin token del proyecto. */
const DEFAULT_CONTAINERS = new Set([
  '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl',
]);

const FORBIDDEN = new Map([
  ['font-serif', 'Sublime no tiene familia serif: Nunito Sans cubre titulos y cuerpo (decision D3)'],
  ['font-mono', 'no hay familia monoespaciada en el sistema de diseño'],
]);

/** Lados, grosores y estilos de borde: utilidades nativas, no colores. */
const BORDER_SIDES = ['t', 'r', 'b', 'l', 'x', 'y', 's', 'e'];
const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none'];
/** Prefijos de fondo que no son color: degradados, posicion, tamano, repeticion. */
const BG_NON_COLOR = [
  'linear-', 'radial-', 'conic-', 'gradient-', 'none', 'cover', 'contain', 'auto',
  'center', 'top', 'bottom', 'left', 'right', 'repeat', 'no-repeat', 'fixed', 'local',
  'scroll', 'clip-', 'origin-', 'blend-', 'position-', 'size-', 'image-',
];

/**
 * Devuelve el sufijo que debe existir como token de color, o null si la clase es una
 * utilidad nativa (lado, grosor o estilo de borde; degradado; fondo no cromatico).
 *
 * `border-b` es un grosor de lado, `border-solid` un estilo, `border-t-primary` el color
 * del lado superior: solo el ultimo necesita token.
 */
function colorSuffix(cls, prefix) {
  let rest = cls.slice(prefix.length);
  if (!rest) return null;

  if (prefix === 'border-') {
    const [head, ...tail] = rest.split('-');
    if (BORDER_SIDES.includes(head)) {
      if (!tail.length) return null; // border-b: grosor del lado
      rest = tail.join('-');
      if (/^\d+$/.test(rest)) return null; // border-l-2: grosor
    }
    if (BORDER_STYLES.includes(rest)) return null;
    if (/^\d+$/.test(rest)) return null;
  }

  if (prefix === 'bg-' && BG_NON_COLOR.some((p) => rest === p || rest.startsWith(p))) return null;

  return rest;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (entry.endsWith('.html') || (entry.endsWith('.ts') && !entry.endsWith('.spec.ts'))) {
      out.push(full);
    }
  }
  return out;
}

function themeTokens(css) {
  const tokens = new Set();
  for (const [, name, value] of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    // `--x: initial` cierra la clave en Tailwind v4: el token deja de existir.
    if (value.trim() !== 'initial') tokens.add(name);
  }
  return tokens;
}

/** Saca las clases candidatas de un fichero: atributos class y cadenas de clases en TS. */
/**
 * Quita comentarios antes de escanear. Los comentarios del proyecto citan clases entre
 * comillas invertidas (`outline-variant`), y el escaner de cadenas las tomaba por clases
 * reales: dos falsos positivos en cuanto se anadieron los prefijos cromaticos.
 */
function stripComments(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function candidateClasses(rawContent) {
  const content = stripComments(rawContent);
  const found = [];
  const attrs = [
    ...content.matchAll(/class="([^"]*)"/g),
    // [class.text-error]="..." es la forma que CLAUDE.md obliga a usar en vez de ngClass,
    // y no contiene la subcadena `class="`, asi que se escapaba entera de la guardia.
    ...content.matchAll(/\[class\.([a-z0-9:.\\[\]%-]+)\]/g),
    // routerLinkActive="..." y otros atributos que llevan clases sin llamarse `class`
    ...content.matchAll(/routerLinkActive="([^"]*)"/g),
    ...content.matchAll(/'([^']*)'/g),
    ...content.matchAll(/`([^`]*)`/g),
  ];
  for (const [, body] of attrs) {
    for (const raw of body.split(/\s+/)) {
      if (!raw) continue;
      // quita variantes (hover:, md:, placeholder:)
      const withoutVariant = raw.split(':').pop() || '';
      // y el modificador de opacidad (bg-navbar/80). Antes la barra hacia fallar la
      // regex y la clase se descartaba entera: `bg-inexistente/80` pasaba sin mirarse,
      // incluso siendo una clase prohibida. Hay 15 clases con modificador en src/app.
      const cls = withoutVariant.split('/')[0];
      if (/^[a-z][a-z0-9-]*$/.test(cls)) found.push(cls);
    }
  }
  return found;
}

const css = readFileSync(TAILWIND_CSS, 'utf8');
const tokens = themeTokens(css);
const files = walk(SRC_APP);
const failures = [];

// 1. Tokens de los que depende media UI: si desaparecen, se queda sin estilo en silencio.
const REQUIRED_TOKENS = [
  '--font-sans',
  '--text-h1',
  '--text-h2',
  '--text-h3',
  '--text-lead',
  '--text-body-md',
  '--text-body-sm',
  '--text-label-sm',
  '--tracking-cta',
  '--tracking-eyebrow',
  '--radius-field',
  '--radius-chip',
  '--color-placeholder',
  '--text-cta',
  '--container-modal-md',
  '--shadow-ambient',
  '--container-content',
];
const missing = REQUIRED_TOKENS.filter((t) => !tokens.has(t));
if (missing.length) {
  failures.push(`Tokens que faltan en @theme de ${TAILWIND_CSS}:\n  ${missing.join('\n  ')}`);
}

// 2. Las familias por defecto de Tailwind que el sistema no usa siguen cerradas con `initial`.
for (const decl of ['--font-serif: initial', '--font-mono: initial']) {
  if (!css.includes(decl)) {
    failures.push(
      `Falta \`${decl}\` en @theme: Tailwind v4 trae esa familia en su tema por defecto, ` +
        `asi que sin cerrarla la clase correspondiente vuelve a emitir CSS (font-serif renderiza en Georgia).`,
    );
  }
}

// 3. Clases que no emiten CSS, y clases prohibidas.
const orphans = [];
const ambiguous = [];
const forbidden = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const lineOf = (cls) => {
    const re = new RegExp(`(^|[\\s"'\`])${cls}(?=[\\s"'\`/]|$)`);
    return lines.findIndex((l) => re.test(l)) + 1;
  };

  for (const cls of new Set(candidateClasses(content))) {
    const reason = FORBIDDEN.get(cls);
    if (reason) {
      forbidden.push(`${file}:${lineOf(cls)} -> ${cls} (${reason})`);
      continue;
    }
    if (NATIVE_UTILITIES.has(cls)) continue;

    let namespaces;
    let suffix;

    if (cls.startsWith('max-w-')) {
      // Tailwind v4 resuelve `max-w-*` contra --spacing-* ANTES que contra --container-*.
      // Validar solo contra --container-* dejaba pasar `max-w-lg`, que existe en el tema por
      // defecto como contenedor pero compilaba a var(--spacing-lg) = 48px. El peligro real no
      // es que falte el token: es que el nombre exista en los DOS namespaces.
      const suffixMw = cls.slice('max-w-'.length);
      if (!suffixMw || /^\d/.test(suffixMw)) continue;
      const asSpacing = tokens.has(`--spacing-${suffixMw}`);
      const asContainer = tokens.has(`--container-${suffixMw}`) || DEFAULT_CONTAINERS.has(suffixMw);
      if (asSpacing && asContainer) {
        ambiguous.push(
          `${file}:${lineOf(cls)} -> ${cls} (ambiguo: --spacing-${suffixMw} gana sobre ` +
            `--container-${suffixMw}, asi que compila a espaciado, no a ancho de contenedor)`,
        );
      } else if (asSpacing) {
        ambiguous.push(
          `${file}:${lineOf(cls)} -> ${cls} (resuelve a --spacing-${suffixMw}: es un valor de ` +
            `espaciado usado como ancho maximo)`,
        );
      } else if (!asContainer) {
        orphans.push(`${file}:${lineOf(cls)} -> ${cls} (no hay token --container-${suffixMw})`);
      }
      continue;
    }

    if (cls.startsWith('bg-') || cls.startsWith('border-')) {
      const prefix = cls.startsWith('bg-') ? 'bg-' : 'border-';
      suffix = colorSuffix(cls, prefix);
      if (suffix === null) continue;
      namespaces = ['--color-'];
    } else {
      const match = [...TOKEN_NAMESPACES]
        .sort((a, b) => b.prefix.length - a.prefix.length)
        .find((ns) => cls.startsWith(ns.prefix));
      if (!match) continue;
      suffix = cls.slice(match.prefix.length);
      namespaces = match.namespaces;
    }

    if (!suffix) continue;
    // `p-4`, `mt-12`, `pb-px`: escala nativa, emite CSS a partir de --spacing
    if (/^\d/.test(suffix) || suffix === 'px') continue;

    const known = namespaces.some((ns) => tokens.has(`${ns}${suffix}`));
    if (!known) {
      orphans.push(`${file}:${lineOf(cls)} -> ${cls} (no hay token ${namespaces[0]}${suffix})`);
    }
  }
}

if (orphans.length) {
  failures.push(
    `Clases que no emiten CSS (${orphans.length}):\n  ${orphans.sort().join('\n  ')}`,
  );
}
if (ambiguous.length) {
  failures.push(
    `Clases max-w-* que no resuelven al ancho esperado (${ambiguous.length}):\n  ` +
      ambiguous.sort().join('\n  '),
  );
}
if (forbidden.length) {
  failures.push(`Clases prohibidas (${forbidden.length}):\n  ${forbidden.sort().join('\n  ')}`);
}

if (failures.length) {
  console.error(`\nx check-tokens: ${failures.length} comprobacion(es) fallida(s)\n`);
  for (const f of failures) console.error(`${f}\n`);
  process.exit(1);
}

console.log(`check-tokens: ok (${files.length} ficheros, ${tokens.size} tokens en @theme)`);
