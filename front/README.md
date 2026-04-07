# TalentoHumano360 - Sistema de Gestión de Recursos Humanos

Sistema de gestión de recursos humanos desarrollado con React + Vite.

## 🚀 Características

- ✅ Arquitectura escalable y organizada
- ✅ React Router para navegación
- ✅ Servicios API configurados para backend
- ✅ Custom hooks para manejo de datos
- ✅ Componentes reutilizables
- ✅ Estilos modernos y responsive
- ✅ Variables de entorno configuradas

## 📁 Estructura del Proyecto

```
TalentoHumano360/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/           # Páginas/Vistas
│   │   ├── Home.jsx
│   │   ├── Empleados.jsx
│   │   ├── Departamentos.jsx
│   │   └── Reportes.jsx
│   ├── services/        # Servicios API
│   │   ├── api.js
│   │   └── empleadosService.js
│   ├── hooks/           # Custom hooks
│   │   └── useFetch.js
│   ├── context/         # Context API (estado global)
│   ├── utils/           # Funciones utilitarias
│   │   └── helpers.js
│   ├── assets/          # Imágenes, iconos, etc.
│   ├── styles/          # Estilos adicionales
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos globales
│   └── main.jsx         # Punto de entrada
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables de entorno
└── package.json
```

## 🛠️ Instalación

1. **Clonar el repositorio** (si aplica) o navegar a la carpeta del proyecto

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
   - Copia el archivo `.env.example` a `.env`
   - Actualiza la URL de tu API backend en `.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

## 🚀 Uso

### Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

### Compilar para Producción
```bash
npm run build
```

### Vista Previa de Producción
```bash
npm run preview
```

## 🔌 Integración con Backend

### Configurar la URL del Backend

Edita el archivo `.env` y actualiza la variable `VITE_API_URL`:
```
VITE_API_URL=http://tu-backend-url/api
```

### Usar los Servicios API

Ejemplo de uso del servicio de empleados:

```javascript
import { empleadosService } from './services/empleadosService';
import { useFetch } from './hooks/useFetch';

// En un componente
function MiComponente() {
  // Usando el custom hook
  const { data, loading, error, refetch } = useFetch(
    () => empleadosService.getAll()
  );

  // O directamente
  const handleCreate = async (empleadoData) => {
    try {
      const nuevoEmpleado = await empleadosService.create(empleadoData);
      console.log('Empleado creado:', nuevoEmpleado);
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

### Crear Nuevos Servicios

Para crear servicios para otras entidades (departamentos, reportes, etc.), sigue el patrón de `empleadosService.js`:

```javascript
// src/services/departamentosService.js
import api from './api';

export const departamentosService = {
  getAll: async () => await api.get('/departamentos'),
  getById: async (id) => await api.get(`/departamentos/${id}`),
  create: async (data) => await api.post('/departamentos', data),
  update: async (id, data) => await api.put(`/departamentos/${id}`, data),
  delete: async (id) => await api.delete(`/departamentos/${id}`),
};
```

## 📝 Próximos Pasos

1. **Conectar con tu backend**: Actualiza la URL en `.env`
2. **Crear servicios adicionales**: Agrega servicios para departamentos, reportes, etc.
3. **Implementar formularios**: Crea componentes de formulario para CRUD
4. **Agregar autenticación**: Implementa login/logout si es necesario
5. **Mejorar UI/UX**: Agrega más estilos y componentes según necesites

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **CSS3** - Estilos

## 📚 Recursos Útiles

- [Documentación de React](https://react.dev)
- [Documentación de Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)

## 👨‍💻 Desarrollo

Este proyecto está listo para comenzar a desarrollar. La estructura está organizada para facilitar:

- ✅ Separación de responsabilidades
- ✅ Escalabilidad
- ✅ Mantenibilidad
- ✅ Reutilización de código

¡Comienza a programar! 🚀
