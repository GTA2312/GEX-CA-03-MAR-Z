# Backlog Narrativo — Plataforma MAR-Z

## 1. Visión General del Producto
La plataforma **MAR-Z** es una aplicación web de gestión colaborativa de solicitudes de soporte técnico orientada a optimizar el flujo de atención interna, asegurar el cumplimiento de Acuerdos de Nivel de Servicio (SLA) y garantizar un esquema de auditoría proporcional y libre de vigilancia personal[cite: 4].

---

## 2. Roles del Sistema y Límites de Acceso

| Rol | Necesidad Principal | Límite Operativo |
|---|---|---|
| **Solicitante** | Crear y consultar el estado de sus solicitudes[cite: 5]. | No accede a solicitudes ajenas[cite: 5]. |
| **Agente** | Atender solicitudes asignadas y registrar avances[cite: 5]. | No administra usuarios[cite: 5]. |
| **Coordinador** | Priorizar, asignar y consultar indicadores agregados[cite: 5]. | No modifica el historial de auditoría[cite: 5]. |
| **Auditor** | Consultar historial de cambios en modo solo lectura[cite: 5]. | No crea, asigna ni resuelve solicitudes[cite: 5]. |

---

## 3. Evolución por Sprints y Cambios Controlados

### Sprint 1: Acceso Seguro y Flujo Inicial (HU01 - HU04)[cite: 6]
* **HU01 (Autenticación y RBAC):** Inicio de sesión seguro con JWT; contraseñas encriptadas; rechazo de acceso sin revelar la existencia previa del usuario[cite: 5, 6].
* **HU02 (Crear Solicitud):** Registro de ticket con `titulo`, `descripcion` y `categoria` obligatorios[cite: 6]. Asignación automática de `_id`, `createdAt`, `estado = 'Nuevo'` y propietario (`solicitante`)[cite: 6].
* **HU03 (Consulta del Solicitante):** Retorno exclusivo de solicitudes creadas por el usuario autenticado[cite: 5, 6].
* **HU04 (Priorización):** Modificación trazable de prioridad permitida únicamente al rol Coordinador[cite: 6].

### Sprint 2: Asignación, Avance y Cierre Trazable (HU05 - HU08 + Cambio Controlado 1)[cite: 6, 7]
* **HU05 (Asignación):** Asignación obligatoria a agentes con estado `Activo` en el sistema[cite: 6]. Registro inmutable de asignador/fecha y notificación en aplicación[cite: 6].
* **HU06 (Comentarios de Trabajo):** Registro de comentarios inmutables, no editables y visibles para roles autorizados[cite: 6].
* **HU07 (Transición de Estados):** Control estricto de flujo (`Nuevo` → `En Proceso` → `Resuelto` → `Cerrado`) e historial completo[cite: 7].
* **HU08 (Confirmación/Reapertura):** El solicitante acepta la solución (`Cerrado`) o reabre el ticket (`En Proceso`) adjuntando obligatoriamente un motivo[cite: 7].
* **Cambio Controlado 1 (Inicio Sprint 2)[cite: 7]:** Adaptación de HU02 y HU04 para exigir campos de `justificacion` y `fechaObjetivo` cuando la prioridad sea **Alta** o **Crítica**[cite: 7].

### Sprint 3: Indicadores Agregados, Auditoría Privada y Exportación (HU09 - HU12 + Cambio Controlado 2)[cite: 7]
* **HU09 (Búsqueda y Filtros):** Búsqueda por texto en título/descripción y filtrado combinado por estado, prioridad y categoría[cite: 7].
* **HU10 (Indicadores Agregados):** Cálculo del volumen por estado/categoría/prioridad y tiempo mediano de ciclo en horas[cite: 7]. Prohibición explícita de incluir rankings individuales de agentes[cite: 4, 7].
* **HU11 (Auditoría Privada):** Vista de eventos en solo lectura[cite: 7]. Codificación de la identidad del actor (`Actor_XXXXXX`) y exclusión de textos libres (títulos, descripciones o comentarios) para cumplir con el principio de no vigilancia[cite: 4, 7].
* **HU12 (Exportación CSV):** Generación de reportes tabulares filtrados que excluyen credenciales y texto no necesario, emitiendo un registro de auditoría (`[AUDITORIA LOG]`) en el servidor[cite: 7].
* **Cambio Controlado 2 (Inicio Sprint 3)[cite: 7]:** Precisión de HU11 y HU12 para garantizar la exclusión estricta de texto libre en logs de auditoría y reportes exportables[cite: 7].

---

## 4. Matriz de Cobertura de Requisitos

| ID | Módulo / Componente | Criterio de Aceptación Crítico | Estado |
|---|---|---|---|
| HU01 | Backend Auth / Frontend Login | RBAC estricto, contraseñas encriptadas, manejo de sesión[cite: 5, 6]. | Completado |
| HU02 | Ticket Model / Modal Crear | Justificación y fecha objetivo obligatorias en Alta/Crítica[cite: 7]. | Completado |
| HU03 | Controller / Dashboard Solicitante | Aislamiento de tickets por propietario (`solicitante: req.user.id`)[cite: 5, 6]. | Completado |
| HU04 | Controller Prioridad / Detalle Ticket | Cambio trazable en `historialPrioridad` con validación condicional[cite: 6, 7]. | Completado |
| HU05 | Controller Asignación / Selector | Asignación restringida a agentes con `estado == 'Activo'`[cite: 6]. | Completado |
| HU06 | Comentarios / Timeline | Inmutabilidad de autor/fecha y prohibición de edición[cite: 6]. | Completado |
| HU07 | Transiciones Estado | Rechazo de saltos inválidos en la matriz de estados[cite: 7]. | Completado |
| HU08 | Confirmación / Reapertura | Exigencia de motivo obligatorio para reabrir solicitudes[cite: 7]. | Completado |
| HU09 | Filtros / Búsqueda | Filtrado dinámico en frontend/backend respetando RBAC[cite: 7]. | Completado |
| HU10 | Indicadores Dashboard | Tiempo mediano de ciclo y volúmenes sin ranking individual[cite: 4, 7]. | Completado |
| HU11 | Auditoría UI / Controller | Codificación `Actor_XXXXXX` + badges `accion`/`detalle` sin texto libre[cite: 1, 3, 7]. | Completado |
| HU12 | Exportación CSV / Auditoría | CSV libre de credenciales y texto plano + log de servidor[cite: 1, 3, 7]. | Completado |