# TecnGo Web

Aplicación web del marketplace TecnGo con React, Vite, TypeScript, React Router,
Axios y Tailwind CSS.

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
- Búsqueda por radio, cotización técnica y confirmación del cliente
- Chat persistente por solicitud
- Centro de notificaciones y seguimiento visual del servicio
- Confirmación de pago en efectivo e historial de pagos del cliente
- Calificación única después del pago
- Historial de ganancias del técnico y panel de comisiones del administrador
- Fotos, documentos y certificados con control de privacidad
- Reputación de ambas partes y calificación cliente-técnico/técnico-cliente
- Cierre de sesión visible para todos los roles
- Rutas protegidas, navegación y redirección por rol

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
npm run preview
```

La URL del backend se configura con `VITE_API_URL`. No se deben guardar secretos en
variables de Vite porque se incluyen en el bundle del navegador.

## Producción

Vercel usa `vercel.json` para el build y el fallback de React Router. Configura
`VITE_API_URL=https://BACKEND_RAILWAY/api`. La ruta `/health` verifica versión y entorno
del backend. La variable debe ser una URL absoluta y requiere un redeploy después de
cambiarla. Cualquier respuesta `401` elimina la sesión y redirige a `/login`.
