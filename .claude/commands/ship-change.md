---
description: Lleva un change del roadmap de Sublime de la propuesta a la PR (OpenSpec + subagentes)
argument-hint: '<nombre-del-change> | siguiente'
---

Ejecuta el flujo completo de un change de `openspec/ROADMAP.md`: $ARGUMENTS

Tú eres el **orquestador**: esta sesión principal lanza a los subagentes (`Explore`, `developer`, `qa`, `design-qa`, `data`, `reviewer`). Los subagentes no pueden lanzar a otros, así que nunca delegues la coordinación.

Hay **dos puntos de parada obligatorios** en los que esperas al usuario: tras la propuesta (fase 1) y al final (fase 4). Fuera de ellos, avanza sin pedir permiso.

---

## Fase 0 — Preparación

1. Lee `CLAUDE.md`, `docs/DESIGN.md`, `openspec/config.yaml` y `openspec/ROADMAP.md`.
2. Resuelve qué change toca:
   - Si `$ARGUMENTS` es un nombre, búscalo en la tabla del roadmap.
   - Si es `siguiente` o está vacío, toma la primera fila cuyo change no exista ni en `openspec/changes/` ni en `openspec/changes/archive/`.
   - Si el nombre no está en el roadmap, díselo al usuario y para.
3. **Decisiones pendientes**: mira la tabla D1–D9 del roadmap. Si el change depende de alguna sin resolver, pregunta al usuario antes de seguir (una sola pregunta clara, con tu recomendación). No inventes contenido de producto.
4. **Detecta el estado del change** y reanuda donde toque (no empieces de cero si ya hay trabajo):
   - No existe `openspec/changes/<change>/` → fase 1.
   - Existe y `tasks.md` no tiene ninguna tarea marcada → la propuesta está pendiente de aprobación: preséntala (parada 1) y espera.
   - Hay tareas marcadas y otras sin marcar → reanuda la fase 2 con las pendientes.
   - Todas marcadas → fase 3.
   - Está en `openspec/changes/archive/` → ya está hecho; avisa y para.
5. **Rama**:
   - Si ya estás en `feat/<change>`, continúa en ella.
   - Si no, parte de `develop` actualizada y crea `feat/<nombre-del-change>`:
     ```bash
     git fetch origin && git switch develop && git merge --ff-only origin/develop && git switch -c feat/<change>
     ```
   - Si hay cambios sin commitear que **no** pertenezcan a este change, para y avisa al usuario (no los mezcles en la rama).
6. Crea la lista de tareas visible con las 4 fases y márcalas según avances.

---

## Fase 1 — Explorar y proponer

1. Lanza el subagente **`Explore`** (solo lectura) para mapear el código afectado: componentes reutilizables, rutas, claves de i18n, servicios y specs existentes en `openspec/specs/`.
2. Lee el/los **frame(s) de Figma** del change (id en el roadmap, archivo `kAEGwQ9NFWaPwyGqI0s8MT`) con `get_design_context` y `get_screenshot`. Hazlo tú en la sesión principal, no en un subagente. Si Figma no está disponible, para y avisa.
3. Si el change toca datos (changes 4, 7 y 12, o cualquier cosa de Supabase), lanza el subagente **`data`** y usa su propuesta en `design.md`.
4. Ejecuta `/opsx:propose <nombre-del-change>` con ese contexto. Respeta las reglas de `openspec/config.yaml`.
5. **Registro de decisiones**: si durante la exploración se resuelve una decisión pendiente (D1–D9), actualiza su fila en `openspec/ROADMAP.md` (resultado y fecha) en el mismo commit que la propuesta. Una decisión que solo vive en la propuesta se pierde para los changes siguientes.
6. 🛑 **PARADA 1.** Presenta al usuario un resumen corto de la propuesta (qué incluye, qué no, tareas, riesgos, decisiones abiertas) y **espera su aprobación**. No escribas código de producción hasta que la dé. Si pide cambios, usa `/opsx:update` y vuelve a presentar.

---

## Fase 2 — Implementar

1. Con la propuesta aprobada, ejecuta `/opsx:apply <nombre-del-change>` delegando en el subagente **`developer`**, una tarea (o un grupo pequeño de tareas relacionadas) por invocación.
2. Cada invocación del `developer` recibe: el nombre del change, las tareas concretas, los ficheros que puede tocar y la ruta del frame de Figma. Marca cada tarea en `tasks.md` solo con evidencia.
   **Commits por sección de `tasks.md`, no por tarea**: el hook de Husky ejecuta `lint`, `doc:graph` y `test:coverage` completos en cada commit y es lento. Cada commit debe dejar lint y tests **en verde**.
   Antes de empezar, revisa el orden de `tasks.md`: si una tarea crea un test que falla a propósito hasta que otra tarea lo arregla (por ejemplo una guardia que lista lo pendiente), **reordena o fusiona** las tareas para que ningún commit quede en rojo. Nunca uses `--no-verify`.
3. **Paralelismo**: solo lanza varios `developer` a la vez si las tareas tocan ficheros distintos. `app.routes.ts`, `public/i18n/*.json` y `src/tailwind.css` se editan siempre en serie.
4. Si el `developer` se bloquea con una duda de producto, no la resuelvas tú: llévala al usuario.

---

## Fase 3 — Verificar

Ejecuta estos subagentes **en este orden** y guarda cada informe:

1. **`qa`**: lint, cobertura por fichero, build, prueba de humo SSR y tests que falten.
2. **`design-qa`**: solo si el change tiene UI. Compara con Figma, `docs/DESIGN.md`, accesibilidad y UX.
3. **`reviewer`**: revisión final contra `tasks.md` y `CLAUDE.md`.

**Bucle de corrección**: si alguno devuelve hallazgos _bloqueantes_ o _importantes_, reúnelos, pásalos al `developer` para que los arregle y repite desde `qa`. Máximo **2 vueltas**. Si tras la segunda siguen los bloqueantes, para y cuéntaselo al usuario con el detalle.

Los hallazgos _menores_ se listan en el cierre; no los arregles sin que el usuario lo pida.

Cuando todo esté aprobado, ejecuta `/opsx:archive <nombre-del-change>` y haz commit del archivado (`chore(openspec): archive <change>`).

---

## Fase 4 — Cierre

🛑 **PARADA 2.** Entrega al usuario un informe corto con:

- Resultado de `qa`, `design-qa` y `reviewer` (una línea cada uno).
- Ficheros y rutas nuevas, y claves de i18n añadidas.
- Hallazgos menores sin arreglar y todo lo que **no se ha podido comprobar** (por ejemplo, móvil sin navegador).
- Decisiones de producto que han quedado abiertas.
- **Rama** `feat/<change>`, el comando para subirla (`git push -u origin feat/<change>`) y el título y la descripción sugeridos para la PR, con destino **`develop`**.

El push y la PR los hace el usuario. No hagas `git push` ni mergees nada.

---

## Reglas que no se rompen

- Nunca commit directo a `main` ni a `develop`; nunca `git push`.
- No actualizar dependencias, ni tocar `angular.json`, `tsconfig*.json`, `eslint.config.*` o `.gitignore`.
- No aplicar cambios en Supabase (ni `apply_migration` ni `execute_sql` de escritura): solo proponerlos.
- Textos de UI siempre por Transloco (es y en). Sin colores hex ni valores arbitrarios.
- Un change = una PR. Si `tasks.md` supera unas 25 tareas o mezcla un cambio global con cambios de componentes, propón dividirlo antes de implementar.
- Si descubres trabajo fuera de alcance, apúntalo como propuesta de un change nuevo en el informe; no lo mezcles.
- Da algo por hecho solo con evidencia (salida de un comando, captura, prueba). Si no pudiste comprobarlo, dilo.
- Si algo no cuadra con el roadmap o con las decisiones pendientes, para y pregunta al usuario en lugar de improvisar.
