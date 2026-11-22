# Spec Delta

## Purpose

Define el contrato visible de los componentes base compartidos de Sublime (botón, chip, badge, campos de formulario, grupo de radios, modal y aviso) y de la capa de tokens de diseño que consumen, de modo que cualquier página del sitio herede la misma tipografía, forma, estados y accesibilidad sin repetir decisiones de estilo.

## ADDED Requirements

### Requirement: Token layer backs every typographic class

Toda clase tipográfica, de forma o de color usada en una plantilla SHALL corresponder a un token declarado en `@theme`. Ninguna plantilla ni cadena de clases SHALL usar un nombre de utilidad que no genere CSS.

#### Scenario: Known broken classes are gone
- **WHEN** se busca `font-label-sm`, `font-body-md`, `font-h3`, `shadow-soft`, `pb-base` o `mb-mb` en `src/`
- **THEN** no hay ninguna aparición

#### Scenario: Every font utility resolves to a family token
- **WHEN** se recopilan las clases `font-*` usadas en `src/` que no son pesos de Tailwind
- **THEN** cada una corresponde a un token de familia declarado en `@theme`

#### Scenario: Styles compile without unknown utilities
- **WHEN** se ejecuta la build de producción
- **THEN** termina sin errores y sin avisos de clase desconocida

### Requirement: Typography follows the approved Figma scale

La UI SHALL usar una sola familia tipográfica, Nunito Sans, en títulos, cuerpo y etiquetas. NO SHALL quedar ninguna regla que aplique una familia serif.

#### Scenario: Single family is loaded
- **WHEN** se carga cualquier página
- **THEN** la hoja de fuentes solicita únicamente Nunito Sans (con su variante itálica) y la familia por defecto del `body` es Nunito Sans

#### Scenario: Headings are not serif
- **WHEN** se renderiza un `h1`, `h2` o `h3`
- **THEN** su familia computada es Nunito Sans

#### Scenario: Scale matches the design
- **WHEN** se aplican las clases de la escala
- **THEN** el título de nivel 1 mide 48px con interlineado 51.84px y tracking −1.2px, el de nivel 2 mide 32px con interlineado 38.4px y tracking −0.64px, el texto lead mide 24px en itálica ligera, el cuerpo mide 16px, el cuerpo pequeño 14px y la etiqueta 12px en mayúsculas con tracking 0.6px

### Requirement: Primary button renders the approved treatment

El botón SHALL ofrecer las variantes `primary`, `secondary` y `ghost`, y los tamaños `sm`, `md` y `lg`. La variante `primary` SHALL tener fondo verde oscuro de marca, texto blanco, esquinas de 2px, etiqueta de 12px en mayúsculas con tracking amplio y transición de al menos 300ms.

#### Scenario: Primary variant
- **WHEN** se renderiza el botón sin especificar variante
- **THEN** usa fondo `deep-moss`, texto blanco, radio de campo y etiqueta en mayúsculas con el tracking de CTA

#### Scenario: Secondary variant
- **WHEN** se renderiza con variante `secondary`
- **THEN** tiene fondo transparente y un borde de 1px, conservando radio, tipografía y transición de la variante primaria

#### Scenario: Disabled button
- **WHEN** el botón está deshabilitado
- **THEN** expone `disabled` en el elemento nativo, no emite su evento de click y se muestra atenuado

#### Scenario: Loading button
- **WHEN** el botón está en estado de carga
- **THEN** no emite su evento de click y comunica el estado de forma accesible

#### Scenario: Keyboard focus is visible
- **WHEN** el botón recibe foco por teclado
- **THEN** muestra un indicador de foco visible que no depende solo del color

### Requirement: Chip presents a selectable pill

SHALL existir un componente de chip con estados seleccionado y no seleccionado, forma de píldora de 12px de radio, etiqueta de 12px en mayúsculas y capacidad de actuar como filtro accionable o como etiqueta estática.

#### Scenario: Selected chip
- **WHEN** el chip está seleccionado
- **THEN** usa fondo `deep-moss` con texto blanco

#### Scenario: Unselected chip
- **WHEN** el chip no está seleccionado
- **THEN** usa fondo tenue de superficie con texto `deep-moss`

#### Scenario: Interactive chip
- **WHEN** el chip es accionable y se activa con click o con teclado
- **THEN** emite su selección y expone su estado seleccionado a tecnologías de asistencia

#### Scenario: Static chip
- **WHEN** el chip solo etiqueta contenido
- **THEN** no es enfocable ni emite eventos

### Requirement: Form fields share one visual contract

Los campos de texto, área de texto y desplegable SHALL compartir fondo blanco, borde de 1px del color de campo, esquinas de 2px, texto de 14px y una etiqueta de 12px en mayúsculas situada encima del campo.

#### Scenario: Default field
- **WHEN** se renderiza un campo sin error
- **THEN** muestra su etiqueta encima, el borde del color de campo y, si lo tiene, un texto de ayuda bajo el campo

#### Scenario: Placeholder styling
- **WHEN** el campo está vacío y tiene marcador de posición
- **THEN** el marcador usa el color de placeholder definido por token

#### Scenario: Field in error
- **WHEN** el campo recibe un mensaje de error
- **THEN** el borde y el mensaje usan el color de error, el mensaje se asocia al control y el control se marca como inválido para tecnologías de asistencia

#### Scenario: Required field
- **WHEN** el campo es obligatorio
- **THEN** su etiqueta lo indica visualmente y el control lo expone a tecnologías de asistencia

#### Scenario: Label is associated
- **WHEN** se activa la etiqueta de un campo
- **THEN** el foco pasa a su control

#### Scenario: Value changes are emitted
- **WHEN** la persona escribe o elige un valor
- **THEN** el componente emite el valor actualizado

### Requirement: Radio group markup is stable across server and client

El grupo de radios SHALL producir el mismo marcado en servidor y en cliente, agrupar sus opciones de forma accesible y permitir orientación vertical u horizontal.

#### Scenario: Deterministic group name
- **WHEN** el mismo grupo de radios se renderiza en servidor y luego se hidrata en cliente
- **THEN** el atributo `name` de sus opciones es idéntico en ambos renders y la hidratación no emite avisos

#### Scenario: Accessible grouping
- **WHEN** se renderiza el grupo con etiqueta
- **THEN** las opciones se exponen como un grupo con esa etiqueta asociada

#### Scenario: Keyboard selection
- **WHEN** se navega el grupo con las flechas del teclado
- **THEN** la selección cambia y se emite el nuevo valor

### Requirement: Modal is safe during server rendering

El modal SHALL poder renderizarse en servidor sin acceder a APIs del navegador, atrapar el foco mientras está abierto y devolverlo al cerrarse.

#### Scenario: Server render does not touch the document
- **WHEN** la página que contiene el modal se prerenderiza
- **THEN** el prerender termina sin errores y sin tocar el documento ni el scroll del `body`

#### Scenario: Scroll lock in the browser
- **WHEN** el modal se abre en el navegador
- **THEN** el scroll de la página queda bloqueado, y al cerrarse se restaura el valor previo

#### Scenario: Focus trap
- **WHEN** el modal está abierto y se tabula
- **THEN** el foco permanece dentro del modal

#### Scenario: Closing the modal
- **WHEN** se pulsa Escape, el botón de cierre o el fondo, estando el modal marcado como cerrable
- **THEN** emite su evento de cierre y el foco vuelve al elemento que lo abrió

#### Scenario: Non-closeable modal
- **WHEN** el modal no es cerrable y se pulsa Escape o el fondo
- **THEN** no emite su evento de cierre

### Requirement: Callout highlights an advisory message

SHALL existir un componente de aviso con fondo tenue, borde izquierdo de 4px en verde de marca, esquinas de 2px y texto en itálica de 14px, usable para advertencias de proceso.

#### Scenario: Callout renders its message
- **WHEN** se renderiza el aviso con un mensaje
- **THEN** muestra el mensaje en itálica con el borde izquierdo de 4px y el fondo tenue

#### Scenario: Callout is announced
- **WHEN** el aviso forma parte de un formulario
- **THEN** su texto es accesible como contenido del formulario y no queda oculto a tecnologías de asistencia

### Requirement: Primitives carry no hardcoded UI copy

Ningún primitivo SHALL incluir texto de interfaz fijo. Todo el texto visible SHALL llegar desde quien lo usa.

#### Scenario: Text comes from the caller
- **WHEN** se inspecciona la plantilla de cualquier primitivo
- **THEN** no contiene cadenas de UI en español ni en inglés, salvo las que recibe por entrada

#### Scenario: Icon-only controls are labelled
- **WHEN** un primitivo renderiza un control sin texto visible, como el cierre del modal
- **THEN** recibe su etiqueta accesible desde quien lo usa

### Requirement: Primitives use OnPush and signal-based state

Todos los primitivos SHALL declarar detección de cambios `OnPush` y derivar sus clases y estado a partir de signals, de forma que cualquier cambio de entrada se refleje sin forzar detección manual.

#### Scenario: Change detection strategy
- **WHEN** se inspecciona la definición de cualquier primitivo
- **THEN** declara `ChangeDetectionStrategy.OnPush`

#### Scenario: Class strings react to input changes
- **WHEN** cambia una entrada que afecta al aspecto, como variante, tamaño o estado de error
- **THEN** el marcado renderizado refleja el cambio sin intervención adicional
