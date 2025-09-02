# Sistema de Gestión Documental - Admin Panel

## 📋 Descripción del Proyecto

Este es un panel administrativo para la gestión documental, desarrollado con Next.js 13+, Supabase y Tailwind CSS. Permite a los administradores gestionar documentos para diferentes flujos (aprendices, instructores y administrativos) de manera segura y eficiente.

## 🚀 Características Principales

- 🔐 Autenticación segura con Supabase Auth
- 📁 Gestión de documentos por flujos
- 🔍 Búsqueda y filtrado avanzado
- 📊 Dashboard interactivo con estadísticas
- 🎨 Interfaz moderna y responsive
- 🛡️ Políticas de seguridad RLS (Row Level Security)

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - Next.js 13+ (App Router)
  - React 18
  - Tailwind CSS
  - Framer Motion
  - TypeScript

- **Backend:**
  - Supabase (Base de datos y autenticación)
  - PostgreSQL
  - Row Level Security (RLS)

- **Almacenamiento:**
  - Supabase Storage

## 📦 Estructura del Proyecto

```
admin/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   │   ├── actions.ts
│   │   │   │   ├── new/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   ├── actions.ts
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── Card.tsx
│   │       ├── DocumentList.tsx
│   │       └── SearchBar.tsx
│   └── utils/
│       ├── supabase/
│       │   ├── client.ts
│       │   └── server.ts
│       └── types/
│           └── database.types.ts
├── public/
└── .env.local
```

## 🔧 Configuración del Entorno

1. **Requisitos Previos:**
   - Node.js 16.8.0 o superior
   - npm o yarn
   - Cuenta en Supabase

2. **Variables de Entorno:**
   Crear un archivo `.env.local` con:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Instalación:**
   ```bash
   git clone https://github.com/proyectoagente2-ops/Admin-Agente.git
   cd admin
   npm install
   npm run dev
   ```

## 📚 Base de Datos

### Tablas Principales

#### 1. documents
```sql
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  version TEXT NOT NULL,
  flow TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

#### 2. admin_users
```sql
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  last_sign_in TIMESTAMP WITH TIME ZONE
);
```

### Políticas de Seguridad (RLS)

```sql
-- Política para documentos
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all documents"
ON documents FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM admin_users
  )
);

-- Más políticas similares para INSERT, UPDATE, DELETE...
```

## 🔐 Autenticación

El sistema utiliza Supabase Auth con las siguientes características:

- Login con email/password
- Verificación de roles administrativos
- Manejo de sesiones
- Protección de rutas

## 📋 Funcionalidades Principales

### 1. Gestión de Documentos

- **Crear Documento:**
  - Título y descripción
  - Código y versión
  - Selección de flujo
  - Upload de archivos
  - Etiquetas

- **Listar Documentos:**
  - Filtrado por flujo
  - Búsqueda por título/descripción
  - Ordenamiento
  - Paginación

- **Acciones:**
  - Ver documento
  - Descargar
  - Eliminar (con confirmación)

### 2. Dashboard

- Estadísticas por flujo
- Lista de documentos recientes
- Filtros y búsqueda
- Interfaz responsive

## 🎨 Componentes UI

### Card
```typescript
interface CardProps {
  children?: ReactNode
  icon?: ReactNode
  title?: string
  value?: string | number
  description?: string
  href?: string
}
```

### DocumentList
```typescript
interface DocumentListProps {
  documents: Document[]
}
```

### SearchBar
```typescript
// Componente con búsqueda en tiempo real y debounce
```

## 🚀 Deployment

El proyecto está configurado para deployment en Netlify:

1. Conectar con el repositorio de GitHub
2. Configurar variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://mtxtepwposnbvojhkymk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Configurar build command: `npm run build`
4. Configurar output directory: `.next`

## 📈 Escalabilidad y Mejoras Futuras

- [ ] Implementación de tests
- [ ] Sistema de logs
- [ ] Mejoras en el manejo de errores
- [ ] Optimización de rendimiento
- [ ] Más opciones de autenticación
- [ ] Sistema de notificaciones
- [ ] Exportación de datos
- [ ] Historial de cambios

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- Juan David  (@ElJuandaa)
- Proyecto Agente (@proyectoagente2-ops)

## 📞 Soporte

Para soporte y preguntas, por favor crear un issue en el repositorio o contactar a los autores.
