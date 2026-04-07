# 🔧 Solución: Control de Acceso a Páginas por Rol

## Problema
Los usuarios no podían acceder a las páginas de **Dashboard General** y **Gestión de Usuarios** porque:
1. La tabla `pages` no existía en la base de datos
2. La tabla `role_pages` no existía para registrar permisos
3. El frontend no validaba permisos a nivel de ruta

## Solución Implementada

### 1. Backend
- ✅ El controlador `auth.controller.js` ya intenta retornar las páginas permitidas
- ✅ Las rutas dinámicas están protegidas a través de `PageProtectedRoute`

### 2. Frontend
- ✅ Creado componente `PageProtectedRoute` que valida acceso a cada página
- ✅ Todas las rutas ahora validan `page_code` antes de permitir acceso
- ✅ Si el usuario no tiene permisos, redirige a `/` (Home)
- ✅ Creada página `Dashboard.jsx`
- ✅ Actualizado `App.jsx` con protección de todas las páginas

### 3. Base de Datos
Necesitas ejecutar el siguiente script en tu MySQL:

```bash
# Desde la consola MySQL
mysql -u root -p personal < backend/scripts/initPages.sql
```

**Contenido del script:**
- Crea tabla `pages` con todos los módulos del sistema
- Crea tabla `role_pages` para permisos de acceso
- Inserta páginas: DASHBOARD, EMPLEADOS, DEPARTAMENTOS, REPORTES, ROLES, PERMISSIONS, ROLE_PERMISSIONS, PLANTA, COSTOS, USUARIOS, ROLE_PAGE_ACCESS
- Asigna acceso **TOTAL** (view+edit) al rol **ADMIN** en todas las páginas
- Asigna acceso **LIMITADO** (view only) al rol **OPER** en páginas de negocio

## Configuración de Accesos por Rol (Post-Instalación)

Una vez ejecutado el script, puedes personalizar accesos:

1. **Inicia sesión como ADMIN**
2. Navega a **"Accesos por Rol"** (menú superior)
3. Selecciona el rol que deseas configurar
4. Marca "Visualizar" y/o "Editar" para cada página
5. Guarda los cambios

### Reglas de Lógica Aplicadas
- ✅ Si desmarcas "Visualizar" → automáticamente se desmarca "Editar"
- ✅ Si marcas "Editar" → automáticamente se marca "Visualizar"
- ✅ Solo ADMIN puede ejecutar cambios de roles y permisos

## Flujo Después de Ejecutar el Script

```
1. Usuario login (ADMIN o OPER)
   ↓
2. Backend retorna:
   - permissions[] (permisos generales)
   - pages[] (páginas permitidas con can_view y can_edit)
   ↓
3. Navbar muestra solo las páginas del usuario
   ↓
4. Usuario intenta acceder a /usuarios o /dashboard
   ↓
5. PageProtectedRoute valida page_code en user.pages
   ↓
6. ✅ Si tiene permiso: muestra la página
   ❌ Sin permiso: redirige a /
```

## Archivos Modificados

- ✅ `front/src/components/PageProtectedRoute.jsx` (NUEVO)
- ✅ `front/src/pages/Dashboard.jsx` (NUEVO)
- ✅ `front/src/App.jsx` (actualizado rutas con protección)
- ✅ `backend/scripts/initPages.sql` (NUEVO - ejecutar en MySQL)

## Próximos Pasos

1. **Ejecuta el script SQL:**
   ```bash
   mysql -u root -p personal < backend/scripts/initPages.sql
   ```

2. **Reinicia el servidor backend:**
   ```bash
   npm run dev
   ```

3. **Reinicia el servidor frontend:**
   ```bash
   npm run dev
   ```

4. **Prueba con estos usuarios:**
   - **Admin:** login: `admin` | password: (contraseña admin)
   - **Operador:** login: `oper` | password: (contraseña oper)

## Notas Importantes

- ⚠️ Sin ejecutar `initPages.sql`, las tablas `pages` y `role_pages` no existirán y el login fallará al intentar cargar páginas
- ⚠️ El script usa `ON DUPLICATE KEY UPDATE` para ser idempotente (puedes ejecutarlo múltiples veces sin riesgos)
- ⚠️ Los accesos por defecto son:
  - **ADMIN**: acceso total a todo
  - **OPER**: solo lectura en módulos de negocio
