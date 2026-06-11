# TecnGo Web

El panel incluye loader global para operaciones mutables, domicilio con
geolocalización, GPS del técnico por polling, seguimiento para el cliente, imágenes de
solicitudes y administración de parámetros exclusivamente para `ADMIN`.

Aplicación web del marketplace TecnGo con React, Vite, TypeScript, React Router,
Axios y Tailwind CSS.

## Arquitectura

La aplicación se organiza por feature en `src/features`. Cada módulo puede contener
`api.ts`, `hooks.ts`, `types.ts`, componentes y páginas. Los workspaces de cliente,
técnico y administrador usan rutas anidadas, por lo que cada flujo carga y actualiza
únicamente sus propios datos.

TanStack Query administra caché, polling, estados de carga/error e invalidaciones.
Las claves están centralizadas en `src/lib/queryClient.ts`; los estados locales se
reservan para formularios, archivos seleccionados y controles de interfaz.

## Incluye

- Landing page responsive
- Login y registro básico de clientes/técnicos conectados al backend
- Persistencia de sesión JWT
- Panel cliente con creación, publicación, cancelación y estados de solicitudes
- Perfil técnico con estado de aprobación
- Solicitudes disponibles, aceptación y avance de estado para técnicos aprobados
- Panel administrador para crear verificadores y aprobar o rechazar técnicos
- Bandeja de documentos para administradores y verificadores
- CRUD administrativo de categorías activas/inactivas
- Ubicación manual o GPS del navegador y presupuesto estimado
- Búsqueda por radio, múltiples cotizaciones y selección de una oferta por el cliente
- Chat persistente por solicitud
- Centro de notificaciones y seguimiento visual del servicio
- Confirmación de pago en efectivo e historial de pagos del cliente
- Calificación única después del pago
- Historial de ganancias del técnico y panel de comisiones del administrador
- Fotos, documentos y certificados con control de privacidad
- Reputación de ambas partes y calificación cliente-técnico/técnico-cliente
- Cierre de sesión visible para todos los roles
- Rutas protegidas, navegación y redirección por rol
- Verificación de correo mediante enlaces enviados por Resend
- Paneles enfocados en solicitudes y edición bajo el botón `Mi perfil`

El registro solicita únicamente nombre, correo, contraseña y tipo de cuenta. Después
del ingreso, cliente o técnico completa su perfil y carga el documento. La interfaz
muestra los estados `CREATED`, `PENDING_VERIFICATION` y `VERIFIED`. Los verificadores
son cuentas internas creadas exclusivamente por un administrador.

## Requisitos

- Node.js 22.22.2 LTS
- npm 10+
- API TecnGo ejecutándose en `http://localhost:8080`

## Ejecución

```bash
cp .env.example .env
npm install
npm run dev
```

Abrir `http://localhost:5173`.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm test
npm run preview
```

La URL del backend se configura con `VITE_API_URL`. No se deben guardar secretos en
variables de Vite porque se incluyen en el bundle del navegador.

## Producción

Vercel usa `vercel.json` para el build y el fallback de React Router. Configura
`VITE_API_URL=https://BACKEND_RAILWAY/api`. La ruta `/health` verifica versión y entorno
del backend. La variable debe ser una URL absoluta y requiere un redeploy después de
cambiarla. Cualquier respuesta `401` elimina la sesión y redirige a `/login`.
