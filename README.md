# Plataforma MAR-Z — Sistema de Gestión Colaborativa de Solicitudes de Soporte

Sistema web completo para la gestión, priorización, asignación, seguimiento y auditoría de solicitudes de soporte técnico interno, desarrollado bajo el stack MERN (MongoDB, Express, React, Node.js) en cumplimiento estricto con las especificaciones del **Modelo MAR-Z - Anexo 10 (V2.0)**[cite: 2, 5].

## 📋 Tabla de Contenidos
- [Requisitos del Sistema y Tecnologías](#requisitos-del-sistema-y-tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Instrucciones de Instalación y Ejecución](#instrucciones-de-instalación-y-ejecución)
- [Datos Semilla y Credenciales de Prueba](#datos-semilla-y-credenciales-de-prueba)
- [Roles de Usuario y Control de Acceso (RBAC)](#roles-de-usuario-y-control-de-acceso-rbac)
- [Matriz de Cumplimiento de Historias de Usuario (HU01 - HU12)](#matriz-de-cumplimiento-de-historias-de-usuario-hu01---hu12)
- [Normativa de Commits y Etiquetado Git](#normativa-de-commits-y-etiquetado-git)


## 🛠 Requisitos del Sistema y Tecnologías

### Stack Tecnológico
* **Frontend:** React (Vite), React Router DOM, Axios, Lucide React / Tailwind CSS.
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS.
* **Base de Datos:** MongoDB / Mongoose ODM.
* **Control de Versiones:** Git (Nomenclatura experimental MAR-Z)[cite: 5].

### Requisitos Previos
* **Node.js:** Versión 18.0.0 o superior.
* **npm:** Versión 9.0.0 o superior.
* **MongoDB:** Instancia local activa (`mongodb://localhost:27017`) o clúster de MongoDB Atlas[cite: 2].

## 📁 Estructura del Proyecto

MAR-Z-Platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Conexión a la base de datos
│   │   ├── controllers/     # Lógica de controladores (ticketController, authController, etc.)
│   │   ├── middleware/      # Verificación JWT y control de acceso por roles (RBAC)
│   │   ├── models/          # Esquemas de Mongoose (User.js, Ticket.js)
│   │   ├── routes/          # Endpoints de la API REST
│   │   └── seed/            # Script de inicialización de datos de prueba
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Modales y componentes reusables (CrearTicketModal, etc.)
│   │   ├── context/         # AuthContext y estado global de la sesión
│   │   ├── pages/           # Vistas principales por rol (Dashboard, Auditoria, Reportes)
│   │   └── services/        # Cliente API Axios
│   ├── .env.example
│   └── package.json
└── docs/                    # Artefactos narrativos y reflexivos del Modelo MAR-Z
    ├── backlog_narrativo.md
    ├── bitacora_reflexion.md
    ├── diario_de_sentido.md
    └── registro_interaccion.md

## ⚙️ Variables de Entorno

Cree un archivo `.env` en las carpetas `backend/` y `frontend/` utilizando como base los archivos `.env.example`:

### Backend (`backend/.env`)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/marz_support_db
JWT_SECRET=super_secreto_para_tokens_marz_2026

### Frontend (`frontend/.env`)

VITE_API_URL=http://localhost:5000/api

## 🚀 Instrucciones de Instalación y Ejecución

Siga los pasos a continuación para iniciar el entorno local de manera reproducible:

### 1. Clonar el Repositorio
git clone <https://github.com/GTA2312/GEX-CA-03-MAR-Z>


### 2. Configurar e Iniciar el Backend
cd backend
npm install
npm run seed     # Poblar base de datos con usuarios y datos semilla ficticios
npm run dev      # Iniciar servidor en modo desarrollo en http://localhost:5000

### 3. Configurar e Iniciar el Frontend
En una nueva terminal:
cd frontend
npm install
npm run dev      
# Iniciar cliente web en http://localhost:5173

## 🔑 Datos Semilla y Credenciales de Prueba

Para efectos de evaluación y pruebas funcionales (PA-01 a PA-12), el script `npm run seed` genera los siguientes usuarios con contraseñas encriptadas mediante `bcrypt` (sin información personal real)[cite: 2, 5]:

| Rol | Correo Electrónico | Contraseña | Permisos y Ámbito[cite: 3] |
|---|---|---|---|
| **Solicitante** | `solicitante@correo.com` | `123456` | Crear solicitudes y consultar únicamente las propias[cite: 3]. |
| **Agente (Activo)** | `agente1@correo.com` | `123456!` | Atender tickets asignados, agregar comentarios e impulsar estados[cite: 3]. |
| **Coordinador** | `coordinador@correo.com` | `123456!` | Priorizar, asignar agentes activos, ver métricas y exportar CSV[cite: 3, 7]. |
| **Auditor** | `auditor@correo.com` | `123456!` | Solo lectura sobre el historial anonimizado de eventos[cite: 3, 7]. |

## 🛡 Roles de Usuario y Control de Acceso (RBAC)

De acuerdo con las restricciones operativas del Anexo 10[cite: 3]:
* **Solicitante:** Creación de tickets. Visualización restringida a sus propias solicitudes (`solicitante: req.user.id`)[cite: 3]. Confirmación o reapertura motivada[cite: 7].
* **Agente:** Gestión de solicitudes asignadas. Inserción de comentarios inmutables[cite: 3, 6]. Cambio de estados permitidos[cite: 7].
* **Coordinador:** Modificación de prioridades, asignación exclusiva a agentes en estado `Activo`, acceso a dashboard con métricas agregadas (tiempo mediano de ciclo) **sin ranking individual** y exportación de reportes CSV[cite: 3, 4, 7].
* **Auditor:** Acceso exclusivo de solo lectura a la traza de eventos[cite: 3]. Codificación estricta de identidades (`Actor_XXXXXX`) y omisión de textos libres para garantizar el principio de no vigilancia[cite: 2, 4, 7].

## 📌 Matriz de Cumplimiento de Historias de Usuario (HU01 - HU12)

| ID | Descripción Funcional | Criterio de Aceptación Crítico | Estado |
|---|---|---|---|
| **HU01** | Autenticación y Roles | Acceso por JWT. Contraseñas hasheadas. Bloqueo de funciones ajenas al rol[cite: 5, 6]. | ✅ Completado |
| **HU02** | Crear Solicitud | Campos obligatorios. Generación automática de ID, fecha y estado `Nuevo`[cite: 6]. **Sprint 2:** Exige `justificacion` y `fechaObjetivo` en prioridad Alta/Crítica[cite: 7]. | ✅ Completado |
| **HU03** | Consultar Mis Solicitudes | Aislamiento por propietario. Consulta de estado y última actualización[cite: 5, 6]. | ✅ Completado |
| **HU04** | Priorizar Solicitudes | Modificación exclusiva por Coordinador[cite: 6]. **Sprint 2:** Requiere `justificacion` y `fechaObjetivo` al elevar a Alta/Crítica[cite: 7]. | ✅ Completado |
| **HU05** | Asignar Solicitud | Asignación válida únicamente a agentes activos. Registro inmutable del asignador[cite: 6]. | ✅ Completado |
| **HU06** | Comentarios de Trabajo | Comentarios inmutables y no editables con autor y fecha congelados[cite: 6]. | ✅ Completado |
| **HU07** | Cambio de Estado | Flujo estricto de transiciones (`Nuevo` → `En Proceso` → `Resuelto` → `Cerrado`)[cite: 7]. | ✅ Completado |
| **HU08** | Confirmar / Reabrir | El solicitante confirma el cierre o reabre adjuntando motivo obligatorio[cite: 7]. | ✅ Completado |
| **HU09** | Búsqueda y Filtros | Filtro dinámico por texto, estado, prioridad y categoría respetando permisos[cite: 7]. | ✅ Completado |
| **HU10** | Indicadores Agregados | Volumen por estado/categoría y tiempo mediano de ciclo. Sin ranking individual[cite: 4, 7]. | ✅ Completado |
| **HU11** | Historial de Auditoría | Solo lectura. Muestra actor codificado (`Actor_XXXXXX`), fecha, badges y suprime textos libres[cite: 1, 3, 7]. | ✅ Completado |
| **HU12** | Exportar Reporte CSV | Exporta CSV filtrado sin credenciales ni texto plano. Emite log de auditoría en servidor[cite: 1, 3, 7]. | ✅ Completado |

## 🏷 Normativa de Commits y Etiquetado Git

Los cambios en el repositorio cumplen con la convención de nomenclatura definida en el Anexo 10[cite: 5]:
`CódigoGrupoExperimental-Sprint-X-FaseDelProyecto-DescripciónContenidoDelArchivo-Fecha AAAAMMDD-Versión`

### Etiquetas de Cierre de Sprint (`Git Tags`)[cite: 5]
git tag -a v1.0-sprint1 -m "Cierre de Sprint 1: Autenticación, RBAC y CRUD inicial (HU01-HU04)"
git tag -a v2.0-sprint2 -m "Cierre de Sprint 2: Ciclo de atención, justificaciones y asignación (HU05-HU08)"
git tag -a v3.0-sprint3 -m "Cierre de Sprint 3: Indicadores, auditoría privada y exportación CSV (HU09-HU12)"
git push origin --tags
