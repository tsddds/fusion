# Activar reservas reales con Google Sheets

La web ya funciona sin evento publicado. Estos pasos conectan la administración real de eventos, cupos, lista de espera y correos de confirmación. No necesitas modificar código.

## Preparación inicial

1. Crea una planilla nueva en Google Sheets, por ejemplo: `Ruyuen · Eventos y reservas`.
2. En esa misma planilla abre **Extensiones → Apps Script**.
3. Reemplaza el contenido del archivo `Code.gs` por el contenido de `google-apps-script/Code.gs` de este proyecto y guarda.
4. En el selector superior de funciones, elige `setupRuyuen` y ejecútala una vez. Google solicitará permisos; acéptalos. Se crearán las seis pestañas y sus encabezados.
5. Ejecuta `setAdminPin` y elige un PIN privado de al menos ocho caracteres. Ese PIN permite usar el panel de equipo de la web.

## Publicar la conexión

1. En Apps Script, abre **Implementar → Nueva implementación**.
2. Elige el tipo **Aplicación web**.
3. En “Quién tiene acceso”, selecciona **Cualquier persona**. La web necesita recibir reservas sin que el visitante inicie sesión.
4. Implementa, autoriza los permisos solicitados y copia la URL que termina en `/exec`.
5. Abre el archivo `.env.local` del proyecto y pega esa URL después de `VITE_RUYUEN_API_URL=`.
6. Reinicia la vista local de la web. Desde ese momento, la portada leerá los eventos publicados desde la planilla y las reservas dejarán de ser de demostración.

> Importante: no compartas el PIN del equipo ni lo subas a redes o repositorios. La URL pública permite solamente las acciones de visitantes; las acciones de equipo requieren el PIN.

## Pestañas y encabezados

`setupRuyuen` crea estas pestañas y encabezados automáticamente. Los campos terminados en `_es`, `_zhHant`, `_en` y `_pt` corresponden a los cuatro idiomas. Completa siempre español: es el idioma predeterminado y el respaldo del sitio.

### Activities

`id | active | order | title_es | title_zhHant | title_en | title_pt | summary_es | summary_zhHant | summary_en | summary_pt | detail_es | detail_zhHant | detail_en | detail_pt | duration_es | duration_zhHant | duration_en | duration_pt | audience_es | audience_zhHant | audience_en | audience_pt | image`

### Events

`id | slug | status | startAt | endAt | registrationOpen | title_es | title_zhHant | title_en | title_pt | summary_es | summary_zhHant | summary_en | summary_pt | venue_es | venue_zhHant | venue_en | venue_pt | address | cover`

`status` acepta `draft`, `published` o `archived`. Las fechas usan formato ISO, por ejemplo `2026-10-11T12:00:00-03:00`.

### Sessions

`id | eventId | activityId | startAt | endAt | capacity | status`

`status` acepta `open`, `closed` o `draft`.

### Notices

`id | active | priority | title_es | title_zhHant | title_en | title_pt | body_es | body_zhHant | body_en | body_pt`

### Bookings y Subscribers

Estas pestañas quedan listas con `setupRuyuen`. No guardes información sensible adicional en ellas.

## Publicar un evento

- Mantén el evento como `draft` mientras preparas la información.
- Crea sus horarios en `Sessions` usando el mismo `eventId`.
- Cambia el evento a `published` y `registrationOpen` a `TRUE` cuando esté listo.
- Al finalizar, cambia su estado a `archived`; aparecerá en el archivo del sitio.

## Qué ocurre con cada reserva

- El sistema valida cupos con un bloqueo transaccional antes de guardar una reserva. No acepta más cupos que la capacidad de cada horario.
- Si un grupo ya no cabe, se guarda como `waitlisted` (lista de espera). El equipo puede promoverlo desde el panel cuando haya cupo para todo el grupo.
- Cuando se proporciona correo, las reservas confirmadas reciben un correo con QR. El QR contiene solamente identificadores de reserva, evento y horario; nunca nombres, correo ni teléfono.
- Los números de WhatsApp se guardan para seguimiento manual; el sistema no envía mensajes automáticos por WhatsApp.
