# CLAUDE MD

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Commands

```bash
npm start            # Dev server at http://localhost:4200 (auto-reloads)
npm run build        # Production build → dist/
npm run watch        # Dev build with watch mode
npm test             # Unit tests with Karma/Jasmine
npm run test:coverage  # Unit tests with coverage report
npm run lint         # ESLint (TypeScript + Angular templates)
npm run serve:ssr:Sublime  # Run the built SSR server at http://localhost:4000
```

To run a single test file: `npx ng test --include='**/path/to/file.spec.ts'`

The pre-commit hook runs `npm test` automatically via Husky.

## Architecture

This is an **Angular 21 SSR application** using `@angular/ssr` with an Express server. It uses **zoneless change detection** (`provideZonelessChangeDetection()`).

### Rendering

- `src/main.ts` — client-side bootstrap
- `src/main.server.ts` — server-side bootstrap
- `src/server.ts` — Express server wrapping `AngularNodeAppEngine`; can add REST API routes here under `/api/`
- `src/app/app.routes.server.ts` — controls per-route render mode (currently `RenderMode.Prerender` for all routes)
- `src/app/app.config.server.ts` — merges server config into `appConfig`

### App config

`src/app/app.config.ts` provides:

- `provideZonelessChangeDetection()` — no Zone.js; all reactivity via signals
- `provideClientHydration(withEventReplay())` — hydration with event replay

### Styling

- Global styles: `src/styles.scss`
- Component styles: SCSS (inline style language configured in `angular.json`)
- Prettier is configured with `printWidth: 100` and `singleQuote: true`

### Code generation

Use the Angular CLI schematic defaults (prefix `app`, SCSS, standalone):

```bash
ng generate component path/to/name
ng generate service path/to/name
ng generate pipe path/to/name
```

Components are generated with SCSS by default (set in `angular.json` schematics).

### Linting

ESLint is configured with `angular-eslint` covering both `.ts` and `.html` files. Template accessibility rules are enabled. Run `npm run lint -- --fix` for auto-fixable issues.

## Design System — Sublime Craft Art (Botanical Minimalism)

Brand personality: tactile craftsmanship meets botanical calm. Target audience values slow fashion, intentionality, and handmade imperfection. The UI is gallery-like — it recedes to let product photography dominate. Every interaction should feel deliberate and soft, mimicking polished resin. Style: **Botanical Minimalism** (sage/moss greens on warm ivory). Source of truth for the design: `DESIGN.md` in the Claude Project.

Tailwind v4 tokens are defined in `src/tailwind.css` via `@theme`. The single font family, **Nunito Sans** (variable, with italics), is loaded via `<link>` in `src/index.html`. There is no serif family: `--font-serif` and `--font-mono` are closed with `initial`, so `font-serif` and `font-mono` emit no CSS and are rejected by `npm run lint:tokens`.

### Colors

Material Design 3 tonal palette. Key roles:

| Role | Token | Use |
|------|-------|-----|
| Page canvas | `bg-surface` | Ivory (#f8faf0), main background |
| Card / highlight | `bg-surface-container-lowest` | Pure white, product cards |
| Borders / dividers | `border-outline-variant` | Soft grey-green (#c5c7bf), 1px, decorative only (1.6:1 contrast) |
| Body text | `text-on-surface` | Near-black green (#191d17), high contrast |
| Secondary text | `text-on-surface-variant` | Muted green-grey (#444841) |
| CTA / primary action | `bg-primary` | Very dark green (#172014) |
| Primary text on dark | `text-on-primary` | White |
| Contrast block | `bg-primary-container` | Deep Moss (#2c3528) — DARK fill, pair with `text-on-primary-container` |
| Light chip / badge | `bg-secondary-container` | Pale sage (#d4e5c8) |
| Brand aliases | `bg-forest-mist` `bg-deep-moss` `bg-ivory-surface` | #d2dcd0 / #2c3528 / #f8faf0. `sage-leaf` (#8c9c82) is decorative only (2.77:1 as text) |

Avoid heavy shadows. Use `border border-outline-variant` (1px) for decorative dividers, and `border-outline` (#757871) where the border is what identifies a control: `outline-variant` is 1.6:1 and fails the 3:1 of SC 1.4.11. When elevation is needed (modals, floating cart) use: `shadow-ambient`.

### Typography

| Scale | Tailwind class | Font | Use |
|-------|---------------|------|-----|
| h1 | `text-h1 tracking-h1` | 48px, Bold 700 | Hero headlines |
| h2 | `text-h2 tracking-h2` | 32px, SemiBold 600 | Section titles |
| h3 | `text-h3` | 24px, SemiBold 600 | Sub-sections |
| lead | `text-lead italic` | 24px, Light 300 | Hero sub-headline |
| body-lg | `text-body-lg` | 18px | Lead paragraphs |
| body-md | `text-body-md` | 16px | Body copy |
| body-sm | `text-body-sm` | 14px | Form fields, small copy |
| label-md | `text-label-md font-semibold tracking-label-md` | 14px | Navigation |
| label-sm | `text-label-sm font-semibold tracking-label uppercase` | 12px | Field labels, tags |
| eyebrow | `text-label-sm font-semibold tracking-eyebrow uppercase` | 12px | Section kickers |
| CTA | `text-cta tracking-cta uppercase` | 12px / 16px box | Button labels |
| label-xs | `text-label-xs` | 10px | Small badge |

Weights for h1-h3 and lead come from the token itself (`--text-h*--font-weight`), so no `font-bold` is needed; an explicit `font-*` class still overrides. Do not add `font-sans`: it is the body default.

Mobile h2 variant: `text-h2-mobile` (28px).

### Spacing

Named spacing tokens: `xs` (8px), `sm` (16px), `md` (24px), `lg` (48px), `xl` (80px), `gutter` (24px), `margin-safe` (32px), `section-gap` (80px). Favor `lg` and `xl` gaps between major sections to achieve the airy, minimalist rhythm.

Layout: 12-column fixed grid, 1200px max-width desktop (`max-w-content`). Storytelling sections → centered. Shopping/functional UI → left-aligned.

### Components

- **Buttons (primary):** `bg-deep-moss text-on-primary rounded-field px-cta-x py-cta-y text-cta uppercase tracking-cta transition-all duration-300`. `text-cta` carries the 16px line box that makes the button 44px tall; `text-label-sm` has a line-height of 1 and would leave it at 40px. Use the `app-button` primitive rather than re-deriving this.
- **Buttons (secondary):** Transparent background, `border border-deep-moss rounded-field`, same shape and slow transition. Not `outline-variant`: at 1.62:1 it falls under the 3:1 WCAG 2.1 SC 1.4.11 asks of a control boundary.
- **Input fields:** full 1px border, `bg-surface-container-lowest border border-outline rounded-field px-field-x py-field-y text-body-sm`, placeholder via `placeholder:text-placeholder`. Labels `text-label-sm font-semibold uppercase tracking-label` above the field; hints and errors are `text-label-sm` in sentence case, never uppercase. Every interactive primitive shares one focus ring, `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`, which changes shape rather than only colour; never pair it with `outline-none`. Use `app-input`, `app-select` and `app-text-area`.
- **Product cards:** `bg-surface-container-lowest rounded-lg` — white fill, no border, separated by whitespace or `bg-primary-container` tint. Generous internal padding.
- **Chips / Tags:** `app-chip` — `rounded-chip` (12px, not a full pill), `px-sm py-chip-y`, `text-label-sm font-extrabold uppercase tracking-label`; `bg-deep-moss text-on-primary` when selected, `bg-surface-container-low text-deep-moss` when not.
- **Navigation:** Centered persistent header, `bg-surface/80 backdrop-blur-[10px]`.
- **Images:** All product photography uses warm-tone treatment. Always use `NgOptimizedImage`.
- **Callouts:** `app-callout` — advisory note with a 4px `border-l-4 border-deep-moss`, tenuous fill and italic `text-body-sm`.

Primitives carry no UI copy of their own: every string reaches them through `input()` or `<ng-content>`, already translated by Transloco. `npm run lint:tokens` fails on any class that emits no CSS, so a typo in a utility is caught instead of silently losing the style.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Workflow: rediseño Sublime con OpenSpec

Para el rediseño de la web, el trabajo se organiza en changes de OpenSpec definidos en `openspec/ROADMAP.md`. Cuando la petición sea ejecutar un change del roadmap, o el usuario invoque `/ship-change`, **sigue `.claude/commands/ship-change.md` en lugar del protocolo ODD de abajo**. Este flujo cuenta como petición explícita de SDD: no crees documentos en `odd/tasks/`.

- Fuente de diseño: `docs/DESIGN.md` y el archivo de Figma indicado en el roadmap.
- La sesión principal orquesta; los subagentes (`developer`, `qa`, `design-qa`, `data`, `reviewer`, `Explore`) no se invocan entre sí.
- El push y la PR (a `develop`) los hace siempre el usuario.

## Workflow: Organic Driven Development (ODD)

Before making any code change, follow this protocol:

1. **Authorize.** Check whether the request asks for a real change or just an explanation/investigation. If it's only explaining or investigating, don't touch code — stay in read-only mode.

2. **Explore.** Review the relevant code and requirements, in proportion to the size of the request. A trivial change doesn't need a full re-read of the project.

3. **Resolve doubts** (at most one intervention per request):
   - If there's a real product decision you can't resolve by exploring, ask ONE specific question and wait for the answer.
   - If you spot a high-risk assumption that hasn't been checked, flag it once before continuing.
   - Don't ask several questions in a row or interrogate the user.

4. **Classify the work:**
   - **Substantial**: exploration reveals 2 or more real implementation steps, or work that would be worth being able to resume if interrupted.
   - **Small**: anything else.

5. **If substantial**, before writing the first line of code:
   - Create a document at `odd/tasks/<feature-name>.md` with: objective, problem, scope, constraints, a task checklist with acceptance criteria, verification evidence, progress, and next step.
   - State in one sentence which document you created and how many tasks it has.

6. **If small**, do it directly. Don't create any document or leave extra traces.

7. **Implement task by task** (substantial work only):
   - Mark a task as done only with observed proof that it works (run the test, check the result) — never just because it "should work".
   - Each task closes with its own commit, with tests and documentation alongside the behavior change, not after.

8. **Close.** When finished, report the verified outcome, any pending or failed checks, and what the next step would be.

> This doesn't replace an explicit request for SDD or a BDD scenario. If I explicitly ask for a spec or a Gherkin scenario, that format takes full priority over this protocol — ODD is the default behavior, not the only one possible.

## Convention: per-feature BDD scenarios

- If a `<feature-name>.feature` file exists inside a feature's folder (`src/app/features/<feature-name>/`), treat it as the source of truth for that feature's expected behavior.
- Before marking any task on that feature as done, verify the result against every `Scenario` in the file: confirm the `Given` matches the real starting state, the `When` matches the implemented action, and the `Then` is actually true — never assume it holds because it "should".
- If no `.feature` file exists for the feature you're touching, follow the normal ODD flow instead (see section above) — a BDD scenario isn't required for every change, only for behavior someone deliberately chose to pin down in writing.
- If you change behavior described in an existing `.feature` file, update it in the same change — never leave it out of sync with the code.
