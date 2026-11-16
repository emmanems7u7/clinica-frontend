# Clínica Odontológica – Frontend

# DESARROLLADORES:

Diego Emanuel Chavez Ramos
Elmer Gustavo Illanes Tarqui
Juan Daniel Calle Quispe


## Requisitos
- Node.js 18 o superior.
- npm.
- Backend Laravel ejecutándose.

## 1. Instalar dependencias

Abrir una terminal en la carpeta del proyecto:

```bash
cd clinica-frontend
npm install
```

## 2. Configurar conexión con el backend

Crear el archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000
```

Esta es la URL del backend Laravel, sin `/api/v1`.

## 3. Configurar CORS en Laravel

En el `.env` del backend agregar:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Después ejecutar en el backend:

```bash
php artisan config:clear
```

## 4. Ejecutar el frontend

Desde la carpeta del frontend:

```bash
npm run dev
```

Abrir en el navegador:

http://localhost:5173

Iniciar sesión con las credenciales del administrador configuradas en los seeders del backend (`SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`).

## 5. Compilar para producción

```bash
npm run build
```

Se generará la carpeta `dist/` con los archivos listos para desplegar.

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm install` | Instala dependencias. |
| `npm run dev` | Levanta el frontend. |
| `npm run build` | Compila para producción. |
| `npm run preview` | Previsualiza la compilación. |

## Importante

- El frontend y backend son proyectos independientes.
- Cada proyecto debe ejecutarse en su propia terminal.
- No subir `node_modules`, `dist` ni archivos `.env` a GitHub.
- Si cambia la URL del backend, reiniciar Vite.