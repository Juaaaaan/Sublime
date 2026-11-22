# Proposal

## Why

`npm run serve:ssr:Sublime` **no sirve la aplicación renderizada en servidor**. Rechaza la cabecera `host` y cae a renderizado en cliente en todas las rutas:

```
ERROR: Bad Request ("http://localhost:4000/contacto").
Header "host" with value "localhost:4000" is not allowed.
Falling back to client side rendering. This will become a 400 Bad Request in a future major version.
```

Las 5 rutas devuelven 200, así que el fallo **no se nota mirando el código de estado**: devuelven el cascarón de 15 709 bytes (`index.csr.html`) en lugar del prerender real, que son entre 28 y 41 KB. Medido: `/contacto` sirve 15 709 bytes cuando en disco tiene 38 984.

Esto apareció verificando el change 1, y tiene dos consecuencias que justifican arreglarlo **antes del change 2**:

1. **Ninguna comprobación SSR manual del roadmap es fiable hoy.** Sin render de servidor no hay hidratación, así que no se puede observar ningún aviso de hidratación ni confirmar su ausencia. La tarea 7.2 del change 1 quedó explícitamente a medias por esto, y los changes 2-16 arrastran la misma limitación.
2. **El aviso del propio framework dice que esto pasará a ser un 400.** Hoy degrada en silencio; en una versión mayor futura, las mismas peticiones fallarán.

Causa: `@angular/ssr` 21 valida la cabecera `host` contra una lista de permitidos para prevenir ataques de reenlace de DNS (`_validation-chunk.mjs`, `verifyHostAllowed`). El proyecto nunca configuró esa lista, así que está vacía y **ningún** host pasa.

## What Changes

- `src/server.ts` pasa `allowedHosts` al constructor de `AngularNodeAppEngine`, con los hosts de desarrollo local (`localhost`, `127.0.0.1`, `[::1]`) y los que lleguen por la variable de entorno `NG_ALLOWED_HOSTS`, que es el mecanismo que el propio framework ya lee.
- El dominio de producción se aporta por entorno, no se escribe en el repositorio: en Vercel, una variable `NG_ALLOWED_HOSTS`. Así el mismo artefacto sirve para previsualizaciones y para producción sin recompilar.
- Se documenta en `CLAUDE.md` que la verificación SSR local requiere ese script y qué hosts están permitidos, porque hoy nada avisa de que el servidor está degradando a cliente.
- Tarea de verificación que compara el tamaño de la respuesta con el del prerender en disco, que es lo que distingue un SSR bueno de un cascarón: el código 200 no sirve para detectarlo.

## Capabilities

### New Capabilities

- `ssr-server`: comportamiento observable del servidor Express que envuelve `AngularNodeAppEngine` — qué hosts atiende con render de servidor, qué hace con los que no reconoce, y cómo se configura el dominio de producción sin tocar el código.

### Modified Capabilities

Ninguna. Los 5 specs existentes describen componentes y páginas; ninguno habla del servidor.

## Non-goals

- No se toca `angular.json`. La vía oficial que documenta Angular es `projects.<nombre>.architect.build.options.security.allowedHosts`, pero `ship-change.md` prohíbe modificar ese fichero, y el constructor de `AngularNodeAppEngine` ofrece el mismo resultado desde `src/server.ts`. Si en el futuro se levanta esa prohibición, mover la lista a `angular.json` es equivalente y más idiomático.
- No se usa `allowedHosts: ['*']` ni `disableHostCheck`. Desactivar la comprobación resuelve el síntoma y reintroduce el agujero que la validación existe para tapar.
- No se cambia el renderizado de ninguna ruta: `app.routes.server.ts` sigue con `RenderMode.Prerender` para todas.
- No se arregla ninguna otra cosa de las que aparecieron al verificar el change 1 (la lista está en `openspec/ROADMAP.md`).
- No se actualizan dependencias.

## Decisiones pendientes

- **Dominio de producción.** Hace falta saber el dominio real del sitio para documentar el valor de `NG_ALLOWED_HOSTS` en Vercel. No bloquea la implementación —el código lee la variable sea cual sea su valor—, pero sí la puesta en producción. Si se despliega hoy sin esa variable, producción seguirá degradando a cliente igual que ahora.

## Impact

- `src/server.ts`: única modificación de código, en la construcción de `AngularNodeAppEngine`.
- `src/server.spec.ts`: no existe hoy; el change lo crea.
- `CLAUDE.md`: nota sobre la verificación SSR local.
- `openspec/ROADMAP.md`: la fila de hallazgos abiertos que apunta a este problema pasa a resuelta, y el change entra en la tabla de orden antes del 2.
- **Desbloquea** la tarea 7.2 del change 1 y todas las comprobaciones SSR de los changes siguientes.
- Sin frames de Figma: no hay interfaz en este change.
