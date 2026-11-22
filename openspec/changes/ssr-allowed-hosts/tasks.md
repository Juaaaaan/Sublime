# Tasks

## 1. Configuración del servidor

- [ ] 1.1 En `src/server.ts`, pasar `allowedHosts` al constructor de `AngularNodeAppEngine`: los hosts locales (`localhost`, `127.0.0.1`, `[::1]`) **unidos** con los que traiga `NG_ALLOWED_HOSTS` separados por comas. Cuidado: pasar la opción al constructor **sustituye** la lectura de la variable que hace el framework, así que la unión hay que hacerla explícita. Nada de `*` ni de `disableHostCheck`. Verificación: `npm run build` en verde y el arranque del servidor sin el error de cabecera en el log.
- [ ] 1.2 Extraer la construcción de la lista a una función exportada y pura (p. ej. `resolveAllowedHosts(env)`), para que sea comprobable sin arrancar un proceso. Verificación: la función existe y `src/server.ts` la usa.

## 2. Pruebas

- [ ] 2.1 Test unitario de `resolveAllowedHosts`: incluye siempre los locales; añade los de la variable; ignora espacios y entradas vacías; **y no pierde los locales cuando la variable está definida** (el error más fácil del change). Verificación: `npx ng test --include='**/server.spec.ts'` en verde con ≥80% de cobertura del fichero.
- [ ] 2.2 Test de integración `scripts/check-ssr.mjs`, invocado por `npm run test:ssr`: arranca el servidor construido en un puerto propio (no el 4000), pide `/` y `/contacto`, y afirma que el cuerpo **no** coincide con `dist/Sublime/browser/index.csr.html` y que contiene texto propio de cada página. Debe fallar con un mensaje claro si falta `dist/`. Verificación: pasa con el arreglo puesto y **falla** si se revierte `src/server.ts` a `new AngularNodeAppEngine()` — demuéstralo ejecutándolo en ambos estados.
- [ ] 2.3 Enganchar `test:ssr` donde corresponda para que no se olvide, sin romper el pre-commit: el test necesita `dist/`, así que valorar si va en el hook (que tendría que construir antes) o solo en la verificación de cada change. Dejar escrito el criterio. Verificación: el script se ejecuta desde npm y el pre-commit sigue pasando en un árbol limpio.

## 3. Documentación y roadmap

- [ ] 3.1 En `CLAUDE.md`, junto a `serve:ssr:Sublime`, anotar que el servidor valida la cabecera `host`, qué hosts acepta por defecto y que el dominio desplegado se añade con `NG_ALLOWED_HOSTS`. Verificación: la nota está y menciona el nombre exacto de la variable.
- [ ] 3.2 En `openspec/ROADMAP.md`, mover este change a la tabla de orden antes del 2 y marcar como resuelta la fila correspondiente de la tabla de hallazgos abiertos. Verificación: ambas tablas coherentes entre sí.
- [ ] 3.3 Anotar en el change archivado `2026-11-22-ui-primitives-sublime` que su tarea 7.2 queda desbloqueada por este change, sin reabrirlo. Verificación: la nota existe y no altera las casillas del change archivado.

## 4. Verificación de integración

- [ ] 4.1 Comprobación manual, con cifras: arrancar `npm run serve:ssr:Sublime`, pedir las 5 rutas y confirmar que el tamaño de cada respuesta coincide con el de su `index.html` en `dist/Sublime/browser/`, y que el log no contiene «Falling back to client side rendering». Verificación: tabla ruta por ruta con los dos tamaños.
- [ ] 4.2 Ahora que hay render de servidor de verdad, comprobar si aparece algún aviso de hidratación en las 5 rutas — lo que la tarea 7.2 del change 1 no pudo hacer. Anotar lo que salga; **no** arreglarlo aquí si aparece algo, salvo que sea trivial y propio de este change. Verificación: lista de avisos por ruta, o la constatación de que no hay ninguno.
- [ ] 4.3 Puerta final: `npm run lint`, `npm run lint:tokens`, `npm run test:coverage` y `npm run build` en verde. Verificación: los cuatro con código 0.
