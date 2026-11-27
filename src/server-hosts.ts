/**
 * Construcción de la lista de hosts permitidos del servidor SSR.
 *
 * Vive en su propio fichero y **no importa nada de Node ni de Express** a propósito:
 * los specs corren en navegador con Karma, así que importar `src/server.ts` —que trae
 * `express` y `node:path`— desde un spec no es posible. Aquí solo hay una función pura
 * que recibe el objeto de entorno como parámetro.
 *
 * Contexto del problema que resuelve: `@angular/ssr` 21 valida la cabecera `host` contra
 * una lista de permitidos. Con la lista vacía no pasa ningún host y el servidor degrada a
 * renderizado en cliente devolviendo 200, así que el fallo no se ve en el código de estado.
 *
 * Trampa del framework: `AngularNodeAppEngine` resuelve sus opciones con
 * `allowedHosts: options?.allowedHosts ?? getAllowedHostsFromEnv()`. Pasar la opción al
 * constructor **sustituye** la lectura de `NG_ALLOWED_HOSTS`, no la acumula. Si la unión no
 * se hace aquí explícitamente, configurar la variable en el despliegue no tendría ningún
 * efecto y producción seguiría degradando en silencio.
 */

/** Nombre de la variable de entorno que el propio framework lee para esta lista. */
export const ALLOWED_HOSTS_ENV_VAR = 'NG_ALLOWED_HOSTS';

/** Hosts de desarrollo local, siempre permitidos sin configuración adicional. */
export const LOCAL_ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]'] as const;

/**
 * Devuelve los hosts locales unidos con los que declare `NG_ALLOWED_HOSTS`,
 * recortando espacios, descartando entradas vacías y sin duplicados.
 *
 * Nunca incluye `*`: la validación de host existe para impedir ataques de reenlace de DNS.
 */
export function resolveAllowedHosts(env: Record<string, string | undefined> = {}): string[] {
  const fromEnv = (env[ALLOWED_HOSTS_ENV_VAR] ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter((host) => host.length > 0);

  return [...new Set([...LOCAL_ALLOWED_HOSTS, ...fromEnv])];
}

/**
 * Avisa cuando el servidor arranca sin dominio configurado.
 *
 * Con la lista ya configurada, un host que no esta en ella deja de degradar a cliente y
 * recibe un 400. Eso es lo correcto, pero convierte `NG_ALLOWED_HOSTS` en un requisito
 * duro del despliegue: sin ella, el dominio publico recibe 400 en todas las rutas. El
 * aviso existe para que ese fallo se vea en el arranque y no en produccion.
 *
 * Devuelve el mensaje en lugar de imprimirlo, para poder comprobarlo sin capturar la
 * consola.
 */
export function describeMissingDeployedHost(
  env: Record<string, string | undefined> = {},
): string | null {
  const configured = resolveAllowedHosts(env).filter(
    (host) => !LOCAL_ALLOWED_HOSTS.includes(host as (typeof LOCAL_ALLOWED_HOSTS)[number]),
  );

  if (configured.length > 0) {
    return null;
  }

  return (
    `[ssr] ${ALLOWED_HOSTS_ENV_VAR} no esta configurada: solo se aceptan ` +
    `${LOCAL_ALLOWED_HOSTS.join(', ')}. Cualquier otro dominio recibira 400. ` +
    `Declara el dominio desplegado en esa variable, separando varios por comas.`
  );
}
