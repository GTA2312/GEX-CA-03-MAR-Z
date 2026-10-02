# Bitácora de Reflexión Técnica y Arquitectura

## 1. Decisiones de Arquitectura (Stack MERN)
* **Persistencia en MongoDB / Mongoose:** Se estructuró el esquema `Ticket.js` utilizando arreglos de subdocumentos (`historialPrioridad`, `historialAsignacion`, `historialEstado`, `comentarios`). Esta decisión garantizó una trazabilidad histórica completa e inmutable sin necesidad de JOINs complejos ni tablas relacionales externas.
* **Autenticación y Seguridad (JWT & RBAC):** La seguridad se centralizó en middlewares de Express que verifican el token JWT y restringen las rutas según el rol asignado (`Solicitante`, `Agente`, `Coordinador`, `Auditor`)[cite: 5]. Las contraseñas se gestionan mediante hashing con `bcryptjs`, asegurando que jamás se almacenen ni transmitan en texto plano[cite: 5].

---

## 2. Desafíos Técnicos y Soluciones de Ingeniería

### Desafío 1: Compatibilidad entre Privacidad de Auditoría y Experiencia de Usuario (HU11)
* **Problema:** Al aplicar el Cambio Controlado 2 del Sprint 3 para excluir textos libres del historial de auditoría[cite: 7], el controlador devolvía únicamente los campos `campo`, `valorAnterior` y `valorNuevo`. Esto provocó que la interfaz del frontend no identificara la propiedad `accion` ni `detalle`, haciendo que todos los eventos se renderizaran con la etiqueta genérica "General".
* **Solución Técnica:** Se refactorizó la función `obtenerHistorialAuditoria` en `ticketController.js` para inyectar explícitamente las propiedades `accion` (`'Creación'`, `'Cambio de Prioridad'`, `'Asignación'`, `'Cambio de Estado'`, `'Reapertura'`, `'Comentario'`) y `detalle` estructurado[cite: 1, 3]. Se mantuvo la codificación del actor mediante la expresión `Actor_${id.slice(-6).toUpperCase()}` y se omitió cualquier texto libre (como títulos, descripciones o contenido de comentarios)[cite: 1, 3, 7].

### Desafío 2: Estandarización Visual de Componentes Frontend
* **Problema:** El modal de creación de solicitudes (`CrearTicketModal.jsx`) presentaba discrepancias estéticas respecto a los componentes más recientes del sistema (`DetalleSolicitudModal.jsx`).
* **Solución Técnica:** Se reestructuró la interfaz adoptando un encabezado uniforme con botón de cierre (`✕`), línea divisoria (`<hr>`), tarjetas contenedoras con sombras suaves, entradas de texto estilizadas y renderizado condicional de los campos `justificacion` y `fechaObjetivo` cuando la prioridad seleccionada es "Alta" o "Crítica"[cite: 2, 3].

### Desafío 3: Exportación Segura de Reportes CSV (HU12)
* **Problema:** Generar reportes CSV útiles para análisis operativo sin vulnerar la restricción de exponer datos confidenciales o texto libre no necesario[cite: 7].
* **Solución Técnica:** `exportarReporteCSV` construye una matriz estructurada con `ID Ticket`, `Categoria`, `Prioridad`, `Estado`, `Agente Asignado`, `Fecha Creacion` y `Ultima Actualizacion`[cite: 1, 3]. Se eliminaron del archivo CSV las credenciales, nombres de solicitantes, títulos y descripciones largas[cite: 1, 3, 7]. Adicionalmente, se implementó el registro `console.log('[AUDITORIA LOG]...')` para dejar traza de la acción en el servidor[cite: 1, 3, 7].

---

## 3. Lecciones Aprendidas
* La implementación del principio *Privacy by Design* exige abstraer los datos sensibles en la capa del backend antes de ser enviados a la red, evitando depender del filtrado en el cliente[cite: 1, 3, 7].
* La cohesión entre los subdocumentos de Mongoose y las estructuras de datos esperadas por React evita regresiones visuales durante refactorizaciones de seguridad.