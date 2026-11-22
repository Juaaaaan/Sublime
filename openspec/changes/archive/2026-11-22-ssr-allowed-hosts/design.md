# Design

## Context

Motivación y medidas en `proposal.md` → *Why*. Lo que hace falta saber para elegir la vía:

- `@angular/ssr` 21.2.30 valida `host` y `x-forwarded-host` en `_validation-chunk.mjs`. `isHostAllowed()` acepta si la lista contiene `*`, el host exacto, o un comodín de subdominio (`*.dominio`). Con la lista vacía **no pasa ningún host**.
- `AngularNodeAppEngine` (`node.mjs:290-302`) resuelve sus opciones así: `allowedHosts: options?.allowedHosts ?? getAllowedHostsFromEnv()`, y `getAllowedHostsFromEnv()` lee la variable `NG_ALLOWED_HOSTS` separada por comas. Es decir, **el framework ya soporta configuración por entorno**, y el valor pasado al constructor la sustituye por completo.
- `src/server.ts` construye hoy `new AngularNodeAppEngine()` sin opciones.
- `src/server.ts` no tiene test. No hay ningún `*.spec.ts` que cubra el servidor.
- Comprobado empíricamente antes de escribir esto: arrancando el binario actual con `NG_ALLOWED_HOSTS=localhost,127.0.0.1`, `/` devuelve 41 567 bytes y `/contacto` 38 984, que es exactamente el tamaño del prerender en disco. Sin la variable, ambas devuelven 15 709.

## Goals / Non-Goals

**Goals:**

- Que `npm run serve:ssr:Sublime` sirva lo que dice servir, sin configuración adicional por parte de quien clona el repositorio.
- Que el dominio desplegado se configure sin tocar el código ni recompilar.
- Que una degradación a renderizado en cliente sea detectable por un test, no solo leyendo el log a mano.

**Non-Goals de diseño:**

- No se introduce un fichero de configuración propio ni una capa de entorno: el framework ya define el mecanismo y añadir otro sería un segundo sitio donde mirar.
- No se cubre el despliegue en sí (variables en el panel de Vercel): eso es operación, y aquí solo se documenta qué variable hace falta.

## Decisions

### D-1. La lista se pasa en el constructor, no en `angular.json`

Angular documenta `projects.<nombre>.architect.build.options.security.allowedHosts` como el sitio canónico. **No se usa** porque `ship-change.md` prohíbe modificar `angular.json`, y el constructor de `AngularNodeAppEngine` produce el mismo efecto desde un fichero que sí está en alcance.

Hay una diferencia real que conviene conocer: la opción de `angular.json` la aplica también el servidor de desarrollo (`ng serve`), mientras que el constructor solo afecta al servidor construido. Como el problema observado está en `serve:ssr` y `ng serve` hoy no se queja, la diferencia no afecta a este change; si algún día `ng serve` empieza a rechazar hosts, habrá que levantar la prohibición y mover la lista.

*Alternativa descartada:* dejar que lo resuelva solo la variable de entorno, sin tocar el código. Funciona (está comprobado), pero obliga a que cada persona que clone el repositorio la exporte a mano, y a documentarlo en un sitio que nadie lee antes de ejecutar el script. El síntoma —un 200 que devuelve el documento equivocado— es demasiado silencioso para depender de eso.

### D-2. Hosts locales en el código, dominio de producción por entorno

`src/server.ts` declara `localhost`, `127.0.0.1` y `[::1]`, y **añade** lo que traiga `NG_ALLOWED_HOSTS`. El dominio real no se escribe en el repositorio por dos motivos: cambia según el entorno (previsualización de Vercel, producción) y no tiene por qué vivir en el código fuente.

Ojo con un detalle del framework: pasar `allowedHosts` al constructor **sustituye** lo que diga la variable, no lo acumula. La unión hay que hacerla explícitamente en `server.ts`; si se olvida, configurar la variable en Vercel no tendrá ningún efecto y producción seguirá degradando en silencio. Es el error más fácil de cometer en este change y debe tener test.

*Alternativa descartada:* `allowedHosts: ['*']`. Resuelve el síntoma en una línea y desactiva una protección contra reenlace de DNS que el framework añadió a propósito.

### D-3. El test compara tamaños, no códigos de estado

El fallo original devolvía 200 en las 5 rutas. Un test de humo que compruebe el código de estado habría pasado durante todo el tiempo que el servidor estuvo roto; de hecho esa es la razón de que nadie lo detectara hasta que se midió el cuerpo.

La prueba que distingue un render de servidor de un cascarón es el **cuerpo**: el documento de arranque pesa unos 15 KB y es idéntico para todas las rutas, mientras que el prerender de cada ruta pesa entre 28 y 41 KB y contiene su contenido. El test arranca el servidor construido, pide una ruta y afirma que la respuesta contiene un texto propio de esa página y que no coincide con `index.csr.html`.

Eso lo convierte en un test de integración que necesita el artefacto construido, no un unitario de Karma —que además corre en navegador y no puede arrancar un proceso—. Va como script de Node invocado por su propio script de npm, el mismo patrón que `lint:tokens`, y se engancha a la puerta de verificación.

*Alternativa descartada:* afirmar sobre `server.ts` con un test unitario, inspeccionando las opciones pasadas al constructor. Cubre que la lista se construye bien, pero no que el servidor sirva, que es lo que falló.

## Risks / Trade-offs

- **El dominio de producción sigue sin estar configurado hasta que alguien ponga la variable en Vercel.** → El change lo deja documentado y lo declara como decisión pendiente; sin ella, producción se comporta como hoy. No empeora nada.
- **El test de integración depende de un build previo y de un puerto libre.** → Usa un puerto alto propio, no el 4000, para no chocar con un servidor que alguien tenga levantado, y falla con un mensaje claro si falta `dist/`.
- **La prohibición de tocar `angular.json` deja la configuración en un sitio menos idiomático.** → Queda escrito en D-1 para que quien venga después sepa que fue una restricción del proceso y no un descuido.
- **`x-forwarded-host` detrás del proxy de Vercel.** → `trustProxyHeaders` por defecto ya acepta `x-forwarded-host` y `x-forwarded-proto`, y la validación se aplica también a esa cabecera: el dominio que llegue por ahí tiene que estar igualmente en la lista. Es otra razón para configurar la variable en el despliegue.

## Migration Plan

Sin migración de datos ni de API. Se despliega con el build.

- **Verificación**: `npm run build` y el test de integración nuevo; además, comprobación manual de que `/contacto` devuelve el mismo tamaño que `dist/Sublime/browser/contacto/index.html`.
- **Rollback**: revertir el commit. El servidor vuelve a degradar a cliente, que es el estado actual.
- **Despliegue**: añadir `NG_ALLOWED_HOSTS` con el dominio real en Vercel. Sin ese paso el change arregla el desarrollo local pero no producción.

## Open Questions

- El dominio de producción, para documentar el valor exacto de la variable. No bloquea la implementación.
