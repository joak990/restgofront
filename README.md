# RestaurantGo — Frontend (Owners)

Panel web para que los dueños administren sus restaurantes. Construido con **Vite + React + TypeScript + Tailwind CSS**.

## Stack

- **Vite** — Build tool
- **React 18** + **React Router DOM v6**
- **TypeScript** — Tipado fuerte
- **Tailwind CSS** — Estilos
- **axios** — Cliente HTTP con interceptor JWT

## 🚀 Setup local

```bash
cd frontend
npm install
cp .env.example .env
# Editá VITE_API_URL si tu backend no corre en localhost:3000
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## ⚙️ Variables de entorno

| Variable | Descripción | Default si vacío |
|---|---|---|
| `VITE_API_URL` | URL base del backend. Si lo dejás vacío se usa `/api` (proxy Vite en dev, rewrite en Vercel en prod) | `/api` |

### 🌐 Proxy de API (sin mostrar URL del backend)

- **Dev (`npm run dev`)**: Vite hace proxy de `/api/*` → `http://localhost:3000/v1/*`. El browser hace requests a `/api/...` y nunca se ve el host del backend.
- **Prod (Vercel)**: `vercel.json` configura un rewrite `/api/:path*` → `https://restgoback.onrender.com/v1/:path*`. El browser hace requests a `https://tu-app.vercel.app/api/...` (la URL del backend no se ve en el cliente).

Si en algún momento querés apuntar a otro backend directamente (ej: un subdominio custom), seteás `VITE_API_URL=https://api.tu-dominio.com/v1` y se ignora el rewrite.

## 🏗️ Build

```bash
npm run build
```

Genera la carpeta `dist/` lista para deploy estático.

## ☁️ Deploy en Vercel

1. Importar el repo desde el dashboard de Vercel
2. Configurar **Root Directory** = `frontend`
3. Framework = **Vite** (auto-detectado)
4. Agregar env var `VITE_API_URL` con la URL de tu backend
5. Deploy

## 🔐 Auth

Por ahora el login es un placeholder: pegás un `googleId` y se envía a `POST /v1/auth/login`. Reemplazar cuando se implemente el flujo de Google OAuth real.

El token JWT se guarda en `localStorage` y el interceptor de axios lo inyecta automáticamente en cada request.

### Roles soportados

El backend devuelve un campo `tipo` con el login. Hoy se esperan:

| Tipo | Ruta | Layout |
|---|---|---|
| `DUENO` | `/dueno` | `OwnerLayout` (sidebar + tabs) |
| `CLIENTE` | — (futuro) | otro panel, aún no implementado |
| `ADMIN` | `/admin` | `AdminPage` |
| `SOPORTE` | `/soporte` | `SoportePage` |

`RequireAuth` rechaza acceso si el rol no coincide con la ruta. Por ahora el backend solo emite `DUENO` y `CLIENTE` — los roles `ADMIN` y `SOPORTE` requieren que el endpoint `/auth/login` los reconozca.

## 📁 Estructura

```
frontend/
├── src/
│   ├── api/            ← axios + endpoints tipados
│   │   ├── client.ts   ← cliente axios + interceptor JWT
│   │   ├── auth.ts     ← login / logout / currentUser
│   │   └── duenos.ts   ← endpoints /duenos/*
│   ├── components/
│   ├── layouts/
│   │   └── OwnerLayout.tsx ← layout con header + navegación
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── MisRestaurantesPage.tsx
│   │   ├── RestauranteDetallePage.tsx
│   │   ├── HorariosPage.tsx
│   │   └── MesasPage.tsx
│   ├── App.tsx         ← router + guardas
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── package.json
```

## ⚠️ Nota sobre CORS

El backend (NestJS) debe estar configurado para aceptar requests desde el dominio del frontend (en dev: `http://localhost:5173`, en prod: el subdominio de Vercel). Si no, los requests van a fallar con `CORS error`.
