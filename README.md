# Frontend Clínica Odontológica (React + Vite)

Parte 2: panel web **independiente** que consume la API REST de la Parte 1 (Laravel + Sanctum). Proyecto propio, con su carpeta, sus dependencias y su servidor de desarrollo. No se copia dentro del proyecto Laravel.

Tecnología: React 18, React Router 6, Vite 5, Font Awesome 6 (iconos `fas fa-…`, instalado por npm, funciona sin internet) y CSS propio.

## 1. Requisitos

- Node.js 18 o superior (`node -v`).
- La API de la Parte 1 funcionando (`php artisan serve` y `php artisan migrate --seed` ya ejecutados).

## 2. Instalación

Descomprima el zip en **una carpeta aparte** (por ejemplo, junto a `clinica-api`):

```
proyectos/
├── clinica-api/        ← Parte 1 (Laravel)
└── clinica-frontend/   ← esta parte (React)
```

```bash
cd clinica-frontend
npm install
```

## 3. Configurar

Edite `.env` (ya viene creado; la plantilla es `.env.example`):

```env
VITE_API_URL=http://localhost:8000
```

Es la dirección de la API, **sin** `/api/v1`.

En el `.env` de **Laravel** debe estar el origen del frontend (ya viene así en `env.additions.txt`):

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Si lo cambió, reinicie la API (`php artisan config:clear` y `php artisan serve`).

## 4. Ejecutar

```bash
npm run dev
```

Abra http://localhost:5173 e ingrese con el admin del seeder (`SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` de su `.env`).

## 5. Estructura

```
src/
├── main.jsx                  entrada y proveedores
├── App.jsx                   rutas y protección de rutas privadas
├── styles.css                estilos y animaciones
├── api/client.js             fetch con Bearer token y manejo de errores/401
├── auth/AuthContext.jsx      sesión, usuario, permisos (can)
├── config/resources.js       columnas, campos, icono y color de cada módulo
├── hooks/useLock.js          bloquea envíos repetidos (doble clic / Enter)
├── components/               Layout, DataTable, FormModal, Btn, Loader, Logo, Toast, Dialog
└── pages/                    Login, Dashboard, ResourcePage (CRUD genérico)
```

Para agregar un módulo nuevo basta con añadir un bloque en `src/config/resources.js` (icono Font Awesome en `icon`, por ejemplo `fa-tooth`, y `color`).

## 6. Qué incluye

- Login con token Bearer en `sessionStorage`; si el token expira vuelve al login. Mostrar/ocultar contraseña y aviso con animación al fallar.
- **Anti doble envío**: todos los botones de guardar, ingresar, eliminar y cambiar estado se bloquean al instante y muestran un spinner (`useLock` + `Btn`). El formulario muestra además el logo animado mientras guarda y no se puede cerrar hasta terminar.
- Menú y botones **según los permisos** de `/auth/me`.
- Inicio con saludo, fecha y contadores animados.
- CRUD con búsqueda, paginación numerada, esqueleto de carga, barra de progreso y filas animadas.
- Citas: cambio de estado desde la tabla (la cancelación pide el motivo en un diálogo propio).
- Diálogos de confirmación propios (sin `confirm()` ni `prompt()` del navegador) y avisos tipo toast con icono y barra de tiempo.
- Errores 422 de la API mostrados bajo cada campo (incluye cita solapada).
- Responsive (menú lateral colapsable en móvil) y respeta «reducir movimiento» del sistema.

## 7. Producción

```bash
npm run build      # genera la carpeta dist/
```

- Suba el contenido de `dist/` a cualquier hosting estático (Nginx, Netlify, etc.). Configure la reescritura de rutas a `index.html` (SPA).
- Antes de compilar, ponga en `.env` la URL real de la API: `VITE_API_URL=https://api.sudominio.com`.
- En Laravel: `CORS_ALLOWED_ORIGINS=https://app.sudominio.com`, `APP_DEBUG=false` y todo bajo **HTTPS**.
