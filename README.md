# Ruyuen · Cultura china en Chile

Sitio institucional de Ruyuen para presentar actividades culturales, publicar eventos y recibir reservas con cupos y lista de espera.

## Uso local

```bash
npm install
npm run dev
```

La web se abre en la dirección que muestra la consola. Sin una conexión de Google configurada, se muestra el contenido institucional y el estado “Próximamente”; no se inventan fechas ni cupos.

## Publicar un evento

La administración se realiza desde Google Sheets. Sigue la guía de [Google Apps Script](google-apps-script/README.md). Allí se incluye la creación automática de pestañas, seguridad del PIN y la publicación de la URL para la web.

## Configuración

Copia `.env.example` como `.env.local` y completa solo lo necesario:

```env
VITE_RUYUEN_API_URL=https://script.google.com/macros/s/TU_ID/exec
VITE_RUYUEN_STAFF_PATH=equipo-ruyuen-7c9f
VITE_RUYUEN_DEMO_ADMIN_PIN=un-pin-solo-para-pruebas-locales
```

No guardes en este archivo credenciales de Google. El PIN de producción se configura directamente en Apps Script con `setAdminPin`.

## Comprobaciones

```bash
npm run lint
npm test
npm run build
```
