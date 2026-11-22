# Spec Delta

## Purpose

Describe el comportamiento observable del servidor Express que envuelve la aplicación Angular en producción y en desarrollo: qué peticiones atiende con render de servidor, cómo trata un host que no reconoce, y cómo se configura el dominio desplegado sin tocar el código.

## ADDED Requirements

### Requirement: The server renders on the server for its own hosts

El servidor SHALL devolver HTML renderizado en servidor para las peticiones cuya cabecera `host` corresponda a un host configurado como permitido. NO SHALL degradar a renderizado en cliente para esos hosts.

#### Scenario: Local development host
- **WHEN** se arranca el servidor construido y se pide cualquier ruta de la aplicación con la cabecera `host` apuntando a la máquina local
- **THEN** la respuesta es 200 y su cuerpo contiene el contenido de la página renderizado, no el documento vacío de arranque

#### Scenario: Response matches the prerendered page
- **WHEN** se pide una ruta prerenderizada a un host permitido
- **THEN** el tamaño del cuerpo devuelto se corresponde con el del documento prerenderizado de esa ruta, y no con el del documento de arranque en cliente

#### Scenario: Deployed domain comes from the environment
- **WHEN** se arranca el servidor con la variable de entorno que declara los hosts permitidos
- **THEN** los hosts que indique esa variable se atienden con render de servidor, sin necesidad de recompilar ni de modificar el código

### Requirement: Unknown hosts do not get server rendering

El servidor SHALL seguir rechazando los hosts que no reconoce. NO SHALL aceptar cualquier host, porque la validación existe para impedir ataques de reenlace de DNS.

#### Scenario: Unrecognised host
- **WHEN** llega una petición cuya cabecera `host` no corresponde a ningún host permitido
- **THEN** no se le entrega contenido renderizado en servidor

#### Scenario: Host validation stays enabled
- **WHEN** se inspecciona la configuración del servidor
- **THEN** la comprobación de host está activa y la lista de permitidos no incluye un comodín que acepte cualquier host

### Requirement: A degraded render is detectable

Un fallo de render en servidor NO SHALL pasar inadvertido tras un código de estado correcto.

#### Scenario: Degradation is visible in the response
- **WHEN** el servidor no puede renderizar en servidor y entrega el documento de arranque en cliente
- **THEN** la diferencia es observable comparando la respuesta con el documento prerenderizado, y el servidor lo registra en su salida
