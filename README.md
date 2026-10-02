# Sistema de Información Estudiantil para la Evaluación de Docentes y Aulas
## "Ranking CAE" - Universidad Mayor de San Andrés (UMSA)

Plataforma estudiantil para la consulta del **Horario Oficial Segundo Semestre Gestión 2026** (Carrera de Administración de Empresas), evaluación de docentes, asignaturas, aulas y muro de opiniones 100% abierto a los estudiantes.

- **Materia:** TIC III
- **Docente:** Lic. Clive Heretthy Quispe
- **Estudiante:** Joel Sandro Tarqui Mamani (C.I. 11077783)
- **Gestión:** 2026, La Paz - Bolivia

---

### ¿Cómo abrir la aplicación?
Abre el archivo `index.html` en tu navegador favorito (Google Chrome, Microsoft Edge, Firefox, Safari, etc.). No requiere conexión a internet ni configuraciones previas.

### Estructura de Archivos
- `index.html`: Estructura semántica con vistas modulares, buscador y muro de comentarios abiertos.
- `styles.css`: Estilos visuales institucionales UMSA (azul `#0f2d59`, oro `#c99700` y verde ecológico `#10b981`), adaptados a móviles.
- `app.js`: Datos oficiales extraídos del horario (Docentes, Materias, Aulas), sensor de infraestructura, moderación preventiva y persistencia con `localStorage`.

### Módulos Principales
1. **👨‍🏫 Horario & Docentes:** Nómina oficial de docentes con sus materias y aulas asignadas (1er a 9no semestre y curso de idioma). Sistema de calificación y modificación en tiempo real: el estudiante puede calificar y modificar el **Índice de Calidad / Claridad** (1-5★) y el **Avance del Syllabus** (50-100%), viendo el cambio numérico reflejado de inmediato en las tarjetas.
2. **🏫 Sensor de Aulas:** Estado de las 15 aulas oficiales del campus (Aula E, 2A, 2C, A, B, C, D, P1, P2, P3A, P3B-LAB, P4, PAB F, LAB MONTES, EX AUD), calificación física (mobiliario, equipos, ventilación) y reporte de impacto ecológico.
3. **📚 Banco de Exámenes Pasados (Subir y Consultar):** Repositorio académico colaborativo para consultar y subir exámenes pasados de 1er a 9no semestre (TIC III, Cálculo, Contabilidad, Finanzas, Microeconomía, Simplex, etc.). Incluye simulador de hoja de examen oficial UMSA, descarga en archivo de texto/imprimible y formulario interactivo para que los estudiantes compartan sus pruebas anteriores.
4. **💬 Muro de Opiniones Aprobadas:** Espacio con filtro por docente donde solo se exhiben comentarios revisados y aprobados previamente por el Administrador, manteniendo la convivencia y el rigor académico.
5. **🛡️ Panel de Moderación & Control Admin:** Bandeja exclusiva donde el Administrador aprueba o descarta opiniones de texto, y herramienta de modificación directa de calificaciones, materias y aulas.
6. **📝 Encuesta de Usabilidad (SUS):** Cálculo interactivo del puntaje de usabilidad estandarizado (> 80 pts).
