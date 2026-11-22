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
  { prefix: 'max-w-', namespaces: ['--container-'] },
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
  'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl',
  'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl',
  // bordes nativos: ancho, no color
  'border-0', 'border-2', 'border-4', 'border-8',
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
function candidateClasses(content) {
  const found = [];
  const attrs = [
    ...content.matchAll(/class="([^"]*)"/g),
    ...content.matchAll(/'([^']*)'/g),
    ...content.matchAll(/`([^`]*)`/g),
  ];
  for (const [, body] of attrs) {
    for (const raw of body.split(/\s+/)) {
      if (!raw) continue;
      // quita variantes (hover:, md:, placeholder:) y el modificador de opacidad
      const cls = raw.split(':').pop() || '';
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
  '--color-outline-field',
  '--color-placeholder',
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
const forbidden = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const lineOf = (cls) => lines.findIndex((l) => l.includes(cls)) + 1;

  for (const cls of new Set(candidateClasses(content))) {
    const reason = FORBIDDEN.get(cls);
    if (reason) {
      forbidden.push(`${file}:${lineOf(cls)} -> ${cls} (${reason})`);
      continue;
    }
    if (NATIVE_UTILITIES.has(cls)) continue;

    let namespaces;
    let suffix;

    if (cls.startsWith('bg-') || cls.startsWith('border-')) {
      const prefix = cls.startsWith('bg-') ? 'bg-' : 'border-';
      suffix = colorSuffix(cls, prefix);
      if (suffix === null) continue;
      namespaces = ['--color-'];
    } else {
      const match = TOKEN_NAMESPACES.find((ns) => cls.startsWith(ns.prefix));
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
if (forbidden.length) {
  failures.push(`Clases prohibidas (${forbidden.length}):\n  ${forbidden.sort().join('\n  ')}`);
}

if (failures.length) {
  console.error(`\nx check-tokens: ${failures.length} comprobacion(es) fallida(s)\n`);
  for (const f of failures) console.error(`${f}\n`);
  process.exit(1);
}

console.log(`check-tokens: ok (${files.length} ficheros, ${tokens.size} tokens en @theme)`);
