📖 SOBRE EL PROYECTO ----------------------------------------------------------------

Pet Finder es una plataforma full-stack diseñada para facilitar el reporte y la búsqueda de mascotas. Prioriza la seguridad del usuario mediante la ofuscación de coordenadas, la validación estricta de datos y una experiencia de usuario (UX) fluida, permitiendo el contacto directo vía WhatsApp o Email.

✨ Características Principales:

🔐 Autenticación Robusta: NextAuth v5 con JWT, cookies persistentes y protección de rutas mediante Middleware.
🗺️ Mapas Interactivos: Integración con Leaflet para selección visual de ubicación, con ofuscación automática de coordenadas (radio de 400m) para proteger la privacidad.
🖼️ Gestión de Imágenes: Subida segura de fotos a Cloudinary directamente desde el servidor (Server Actions), sin exponer claves de API al cliente.
⚡ Rendimiento Optimizado: Paginación en base de datos, índices compuestos en PostgreSQL, Suspense para streaming de UI y carga dinámica (next/dynamic) de librerías pesadas.
🛡️ Seguridad y Anti-Spam: Validación de esquemas con Zod (cliente y servidor), hashing de contraseñas con bcryptjs, y límites de tasa (rate limiting) para prevenir creación masiva de reportes.
📱 UX Inteligente: Detección automática de formato de contacto (Email vs. Teléfono argentino) para abrir el cliente de correo o WhatsApp directamente.

🛠️ TECH STACK ----------------------------------------------------------------

Categoría      Tecnologías
Framework      Next.js 16 (App Router, Turbopack, Server Actions)
Lenguaje       TypeScript (Estricto)
Base de Datos  PostgreSQL (NeonDB Serverless) + Prisma ORM 7
Estilos        Tailwind CSS 4 + shadcn/ui (Radix UI)
Formularios    React Hook Form + Zod (Validación end-to-end)
Autenticación  Auth.js (NextAuth) v5
Mapas          Leaflet + React-Leaflet
Almacenamiento Cloudinary (Imágenes)
Utilidades     bcryptjs, lucide-react, date-fns (o Intl)

🏗️ Decisiones de Arquitectura y Seguridad ----------------------------------------------------------------

1. Privacidad por Diseño (Coordinate Obfuscation): Las coordenadas reales (realLat, realLng) se guardan en la BD, pero la UI y las consultas públicas solo reciben publicLat y publicLng, calculadas con un algoritmo de desplazamiento aleatorio de ~400 metros.

2. Server-First Data Mutations: Todas las creaciones y actualizaciones de datos se manejan mediante Server Actions. Esto elimina la necesidad de API routes tradicionales, reduce el bundle size del cliente y garantiza que operaciones sensibles (como subir a Cloudinary o validar sesiones) nunca se expongan en el navegador.

3. Consultas de Base de Datos Seguras: Uso estricto de select en Prisma en lugar de include para las consultas públicas, garantizando que campos sensibles (como userId, realLat o emails de autores) nunca sean serializados y enviados al cliente.

4. Optimización de Índices: Se implementaron índices compuestos en Prisma @@index([status, createdAt]) y @@index([userId, createdAt])) para garantizar que las consultas paginadas y de rate limiting sean O(logN), escalando eficientemente con el crecimiento de la tabla.

5. Manejo de Estados de Carga: Uso de useFormStatus y componentes de esqueleto (Suspense fallback) para proporcionar feedback visual inmediato sin bloquear el hilo principal.


🚀 EJECUCIÓN LOCAL ----------------------------------------------------------------

Prerrequisitos

Node.js 20.x o superior
pnpm (Recomendado) o npm/yarn
Una base de datos PostgreSQL (ej. NeonDB)
Cuenta en Cloudinary

Pasos de instalación

1. Clona el repositorio:

   git clone https://github.com/tu-usuario/pet-finder-v2.git
   cd pet-finder-v2

2. Instala las dependencias:
   pnpm install

3. Configura las variables de entorno:

Crea un archivo .env en la raíz del proyecto y completa los valores:

   Base de Datos (NeonDB)
   DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

   NextAuth v5
   AUTH_SECRET="tu_clave_secreta_generada_con_crypto_randomBytes"
   NEXTAUTH_URL="http://localhost:3000"

   Cloudinary
   CLOUDINARY_CLOUD_NAME="tu_cloud_name"
   CLOUDINARY_API_KEY="tu_api_key"
   CLOUDINARY_API_SECRET="tu_api_secret"

4. Ejecuta las migraciones de la base de datos y genera el cliente de Prisma:

   pnpm prisma migrate dev --name init
   pnpm prisma generate

5. Inicia el servidor de desarrollo:

   pnpm dev o pnpm run dev

   Abre http://localhost:3000 en tu navegador.


📂 ESTRUCTURA DEL PROYECTO (RESUMEN) ----------------------------------------------------------------

├── prisma/
│   ├── schema.prisma        # Modelo de datos e índices optimizados
│   └── migrations/          # Historial de migraciones
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Rutas de login y registro (con protección de redirección)
│   │   ├── dashboard/       # Rutas protegidas (listado, creación, mapa de reporte)
│   │   ├── layout.tsx       # Root layout con SessionProvider
│   │   └── page.tsx         # Landing page estática optimizada
│   ├── components/          # Componentes reutilizables (UI, Mapas, Smart Buttons)
│   ├── lib/
│   │   ├── auth.ts          # Configuración de NextAuth
│   │   ├── prisma.ts        # Singleton de Prisma con Driver Adapter
│   │   ├── report-actions.ts# Server Actions (Creación, resolución, validación)
│   │   ├── cloudinary.ts    # Lógica segura de subida de imágenes (Server-side)
│   │   └── geoUtils.ts      # Algoritmo de ofuscación de coordenadas
│   └── types/               # Extensiones de tipos (ej. next-auth.d.ts)
└── .env                     # Variables de entorno (No versionado)

🔮 PRÓXIMAS MEJORAS (ROADMAP) ----------------------------------------------------------------

Implementar notificaciones por email (Resend) cuando alguien contacta sobre un reporte.
Agregar filtrado avanzado en el dashboard (por especie, tipo, fecha).
Panel de administración básico para moderación de contenido.
Soporte para PWA (Progressive Web App) para instalación en móviles.


👨‍💻 AUTOR ----------------------------------------------------------------
FeliSic
www.linkedin.com/in/felipe-sicca | [GitHub](https://github.com/FeliSic) | https://landing-page-presentation-azure.vercel.app/
