### 2.1 Estructura Recomendada
```
frontend/
├── src/
│   ├── api/              # Configuración de Axios y endpoints
│   │   ├── client.ts
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── workouts.ts
│   │   │   ├── exercises.ts
│   │   │   └── users.ts
│   │   └── types/        # Types compartidos con el backend
│   │
│   ├── components/       # Componentes reutilizables
│   │   ├── ui/          # Componentes de shadcn
│   │   ├── common/      # Componentes comunes (Header, Footer)
│   │   ├── forms/       # Formularios específicos
│   │   └── layouts/     # Layouts (AuthLayout, DashboardLayout)
│   │
│   ├── features/        # Funcionalidades por módulo
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── pages/
│   │   ├── workouts/
│   │   ├── exercises/
│   │   └── profile/
│   │
│   ├── hooks/           # Custom hooks globales
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   │
│   ├── lib/             # Utilidades y configuraciones
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── store/           # Zustand stores
│   │   ├── authStore.ts
│   │   └── workoutStore.ts
│   │
│   ├── types/           # TypeScript types globales
│   │   └── index.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
└── public/