/**
 * ============================================================================
 * Plataforma Ranking CAE - Universidad Mayor de San Andrés (UMSA)
 * Carrera de Administración de Empresas - Horario Segundo Semestre Gestión 2026
 * Archivo: app.js
 * 
 * Funcionalidades Centrales:
 * 1. Calificación completa de Docentes: Índice de Calidad/Claridad y Cumplimiento de Syllabus (%).
 * 2. Calificación completa de Aulas: Condiciones de Mobiliario, Equipos, Ventilación y Eco-Sensor.
 * 3. Moderación y Aprobación Exclusiva por el Administrador: Las calificaciones numéricas
 *    impactan de inmediato, pero los comentarios de texto solo se publican tras tu aprobación.
 * ============================================================================
 */

// Palabras no permitidas para el motor de moderación preventiva (RF09)
const BANNED_WORDS = [
  'estúpido', 'estupido', 'incompetente', 'idiota', 'ladrón', 'ladron', 
  'inútil', 'inutil', 'basura', 'corrupto', 'sinvergüenza', 'burro', 'odio',
  'porquería', 'porqueria', 'asno', 'maldito'
];

// Estado de sesión
let currentUser = {
  token: 'EST-UMSA-' + Math.floor(1000 + Math.random() * 9000),
  role: 'estudiante', // 'estudiante' o 'admin'
  anonimizado: true
};

// Medidor de consumo de red (< 5 MB)
let sessionDataConsumedKB = 164.8;

// ============================================================================
// BASE DE DATOS DE DOCENTES (HORARIO OFICIAL 2026)
// ============================================================================
const defaultDocentes = [
  {
    id: 'DOC-001',
    nombre: 'ARRIETA CHUQUIMIA JUAN AURELIO',
    asignatura: 'ADM-101 ADMINISTRACIÓN I / ADM-302 ADMINISTRACIÓN III',
    aula: 'E (Sem 1) / E, A (Sem 3)',
    semestre: '1er y 3er Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 98,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 32,
    metodologia: ['Casos de Estudio', 'Práctico'],
    descripcion: 'Enfoque práctico en teorías de la administración, estructura organizacional y toma de decisiones empresariales.',
    evaluaciones: [
      {
        id: 'EV-101',
        autor: 'Estudiante_#3819',
        puntuacion: 5,
        claridad: 5,
        cumplimiento: 100,
        materia: 'ADM-101 ADMINISTRACIÓN I',
        comentario: 'Excelente docente, sus clases en el Aula E son muy puntuales y los ejemplos de empresas reales ayudan mucho a entender la materia.',
        fecha: '2026-03-02',
        likes: 14,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-002',
    nombre: 'PEREZ CENTELLAS DOMINGO JULIO',
    asignatura: 'MAT-102 CÁLCULO / MAT-204 ESTADÍSTICA I',
    aula: 'E (Sem 1) / D (Sem 2)',
    semestre: '1er y 2do Semestre',
    indiceClaridad: 4.4,
    cumplimientoPrograma: 94,
    puntuacionGeneral: 4.5,
    evaluacionesCount: 26,
    metodologia: ['Práctico', 'Expositivo'],
    descripcion: 'Desarrollo sistemático de cálculo diferencial e integral, y estadística descriptiva aplicada a los negocios.',
    evaluaciones: [
      {
        id: 'EV-102',
        autor: 'Estudiante_#6041',
        puntuacion: 4.5,
        claridad: 4.5,
        cumplimiento: 95,
        materia: 'MAT-102 CÁLCULO',
        comentario: 'Resuelve muchos ejercicios en la pizarra. Si asistes a todas sus clases y practicas las guías se aprueba con buena nota.',
        fecha: '2026-03-04',
        likes: 8,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-003',
    nombre: 'ANCALLE CHOQUE DEMETRIO',
    asignatura: 'FIN-103 CONTABILIDAD I / FIN-301 ADMINISTRACION DE COSTOS I',
    aula: 'E (Sem 1) / D (Sem 3)',
    semestre: '1er y 3er Semestre',
    indiceClaridad: 4.6,
    cumplimientoPrograma: 96,
    puntuacionGeneral: 4.7,
    evaluacionesCount: 35,
    metodologia: ['Práctico', 'Casos de Estudio'],
    descripcion: 'Especialista en estados financieros, balance general, asientos contables y control de costos de producción.',
    evaluaciones: [
      {
        id: 'EV-103',
        autor: 'Estudiante_#1902',
        puntuacion: 5,
        claridad: 4.8,
        cumplimiento: 98,
        materia: 'FIN-103 CONTABILIDAD I',
        comentario: 'Explica con mucha paciencia la dinámica contable. Muy recomendado para quienes ven contabilidad por primera vez.',
        fecha: '2026-03-05',
        likes: 15,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-004',
    nombre: 'PEREZ SANCHEZ VIERKA VIVIANA',
    asignatura: 'CJS-104 DERECHO CONSTITUCIONAL / ADM-107 TALLER DE INVESTIGACIÓN / CJS-203 DERECHO EMPRESARIAL',
    aula: '2A, E (Sem 1) / 2A (Sem 2)',
    semestre: '1er y 2do Semestre',
    indiceClaridad: 4.7,
    cumplimientoPrograma: 97,
    puntuacionGeneral: 4.7,
    evaluacionesCount: 38,
    metodologia: ['Expositivo', 'Casos de Estudio', 'Debate'],
    descripcion: 'Marco legal empresarial, legislación laboral, comercial y normativa constitucional para administradores.',
    evaluaciones: [
      {
        id: 'EV-104',
        autor: 'Estudiante_#7743',
        puntuacion: 4.8,
        claridad: 4.7,
        cumplimiento: 96,
        materia: 'CJS-104 DERECHO CONSTITUCIONAL',
        comentario: 'Clases muy amenas y con análisis de leyes actuales. El aula 2A es cómoda pero suele faltar ventilación por las tardes.',
        fecha: '2026-03-06',
        likes: 10,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-008',
    nombre: 'HERRERA CARDENAS FELIX ABRAHAM',
    asignatura: 'MAT-102 CÁLCULO / MAT-204 ESTADÍSTICA I / MAT-205 INV. OPERATIVA I / MAT-304 / MAT-405',
    aula: 'C, 2C, E, A',
    semestre: '1er, 2do, 3er y 4to Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 99,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 54,
    metodologia: ['Práctico', 'Resolución de Problemas'],
    descripcion: 'Pilar docente en el área cuantitativa de la carrera: métodos matemáticos, programación lineal e inferencia estadística.',
    evaluaciones: [
      {
        id: 'EV-105',
        autor: 'Estudiante_#9901',
        puntuacion: 5,
        claridad: 4.9,
        cumplimiento: 100,
        materia: 'MAT-205 INVESTIGACIÓN OPERATIVA I',
        comentario: 'Excelente docente de métodos cuantitativos. Método simplex y modelos de transporte explicados al detalle.',
        fecha: '2026-03-07',
        likes: 22,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-017',
    nombre: 'PEREZ MOLLINEDO MARISOL IRENE',
    asignatura: 'FIN-202 CONTABILIDAD II / ADM-305 TALENTO HUMANO I / ADM-403 / ADM-906 Y 907',
    aula: '2A, D, A, P3A',
    semestre: '2do, 3er, 4to y 9no Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 98,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 46,
    metodologia: ['Dinámico', 'Casos de Estudio'],
    descripcion: 'Especialista en gestión estratégica del talento humano, bienestar laboral y seguridad ocupacional.',
    evaluaciones: [
      {
        id: 'EV-106',
        autor: 'Estudiante_#4421',
        puntuacion: 5,
        claridad: 4.8,
        cumplimiento: 97,
        materia: 'ADM-305 GESTIÓN DEL TALENTO HUMANO I',
        comentario: 'Clases súper dinámicas en el Aula A. Hace dinámicas de reclutamiento y simulaciones de entrevistas de trabajo.',
        fecha: '2026-03-08',
        likes: 16,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-020',
    nombre: 'ITURRALDE EGUEZ ALBERT ALEXANDER',
    asignatura: 'ECO-207 MICROECONOMÍA / ECO-306 MACROECONOMIA / ECO-702 Y ECO-801 PROYECTOS',
    aula: '2A, 2C, A, P1',
    semestre: '2do, 3er, 7mo y 8vo Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 98,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 48,
    metodologia: ['Casos de Estudio', 'Práctico'],
    descripcion: 'Referente en formulación, evaluación ex-ante y ex-post de proyectos de inversión privada y pública.',
    evaluaciones: [
      {
        id: 'EV-107',
        autor: 'Estudiante_#8812',
        puntuacion: 5,
        claridad: 4.9,
        cumplimiento: 98,
        materia: 'ECO-801 ADMINISTRACIÓN Y EVALUACIÓN EX POST DE PROYECTOS',
        comentario: 'El docente domina VAN, TIR y análisis de sensibilidad como nadie. Muy exigente pero aprendes muchísimo en el Aula P1.',
        fecha: '2026-03-09',
        likes: 19,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-026',
    nombre: 'RIVEROS NAVA PABLO DANIEL',
    asignatura: 'ADM-302 ADM. III / ADM-303 EMPRENDIMIENTO / ADM-402 / ADM-502 / ADM-605',
    aula: 'E, A, PAB F, P2',
    semestre: '3er, 4to, 5to y 6to Semestre',
    indiceClaridad: 4.9,
    cumplimientoPrograma: 98,
    puntuacionGeneral: 4.9,
    evaluacionesCount: 56,
    metodologia: ['Proyectos', 'Casos de Estudio'],
    descripcion: 'Ecosistemas de emprendimiento, incubación de negocios y estructura directiva empresarial.',
    evaluaciones: [
      {
        id: 'EV-108',
        autor: 'Estudiante_#2109',
        puntuacion: 5,
        claridad: 4.9,
        cumplimiento: 99,
        materia: 'ADM-303 EMPRENDIMIENTO',
        comentario: 'Un docente de vocación. Te ayuda a diseñar tu propio modelo de negocio CANVAS y validarlo con clientes reales.',
        fecha: '2026-03-10',
        likes: 25,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-031',
    nombre: 'ROCA CLADERA MICHAEL JOHNNY',
    asignatura: 'FIN-406 MAT. FINANCIERA / FIN-504 FINANZAS I / FIN-603 / FIN-705 / FIN-809',
    aula: 'D, P1, P2, PAB F',
    semestre: '4to, 5to, 6to, 7mo y 8vo Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 98,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 49,
    metodologia: ['Práctico', 'Casos de Estudio'],
    descripcion: 'Ingeniería financiera, matemática actuarial, derivados y gestión de carteras de inversión.',
    evaluaciones: [
      {
        id: 'EV-109',
        autor: 'Estudiante_#7110',
        puntuacion: 5,
        claridad: 4.8,
        cumplimiento: 98,
        materia: 'FIN-504 FINANZAS I',
        comentario: 'Un docente de primer nivel en finanzas. Muy exigente en los ejercicios pero sales preparado para trabajar en bancos.',
        fecha: '2026-03-11',
        likes: 18,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-034',
    nombre: 'HERETTHY QUISPE CLIVE',
    asignatura: 'TIC-703 TECNOLOGÍA DE LA INFORMACIÓN Y COMUNICACIÓN III',
    aula: 'P3B-LAB',
    semestre: '7mo Semestre',
    indiceClaridad: 4.9,
    cumplimientoPrograma: 99,
    puntuacionGeneral: 4.9,
    evaluacionesCount: 48,
    metodologia: ['Casos de Estudio', 'Práctico', 'Proyectos'],
    descripcion: 'Docente titular en Sistemas de Información, metodología BPMN, DevOps y desarrollo de soluciones de gestión centradas en el usuario.',
    evaluaciones: [
      {
        id: 'EV-110',
        autor: 'Estudiante_#3304',
        puntuacion: 5,
        claridad: 5,
        cumplimiento: 100,
        materia: 'TIC-703 TIC III',
        comentario: 'Sus clases en el Laboratorio P3B son de las más útiles de la carrera. Enseña a plantear problemas reales y transformarlos en herramientas digitales funcionales.',
        fecha: '2026-03-12',
        likes: 27,
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'DOC-036',
    nombre: 'ALIENDRE ESPAÑA FREDDY EUSEBIO',
    asignatura: 'GPU-505 GESTIÓN PÚBLICA I / GPU-701 / GPU-711 / GPU-811 / ADM-901',
    aula: 'EX AUD, P3A',
    semestre: '5to, 7mo, 8vo y 9no Semestre',
    indiceClaridad: 4.8,
    cumplimientoPrograma: 97,
    puntuacionGeneral: 4.8,
    evaluacionesCount: 44,
    metodologia: ['Expositivo', 'Debate', 'Casos'],
    descripcion: 'Especialista en administración y políticas públicas, Ley 1178 (SAFCO) y modernización del Estado.',
    evaluaciones: []
  },
  {
    id: 'DOC-040',
    nombre: 'TABORGA MANRIQUEZ GONZALO',
    asignatura: 'CURSO DE IDIOMA - INGLES',
    aula: 'PAB F',
    semestre: 'Curso de Idioma',
    indiceClaridad: 4.6,
    cumplimientoPrograma: 95,
    puntuacionGeneral: 4.6,
    evaluacionesCount: 28,
    metodologia: ['Práctico', 'Dinámico'],
    descripcion: 'Inglés técnico para negocios internacionales, redacción de correos corporativos y presentaciones de empresa.',
    evaluaciones: []
  }
];

// ============================================================================
// BASE DE DATOS DE AULAS (AULAS DEL PDF) CON CALIFICACIONES FÍSICAS
// ============================================================================
const defaultAulas = [
  {
    id: 'Aula E',
    piso: 'Piso 1',
    ubicacion: 'Edificio Central - Bloque A',
    capacidad: 65,
    estado: 'Óptimo',
    puntuacionGeneral: 4.8,
    mobiliarioRating: 4.7,
    equiposRating: 4.8,
    ventilacionRating: 4.6,
    evaluacionesCount: 18,
    activos: [
      { nombre: 'Pupitres ergonómicos en buen estado', ok: true },
      { nombre: 'Iluminación LED y Tomas eléctricas funcionales', ok: true },
      { nombre: 'Data Display HDMI operativo', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: [
      {
        id: 'REV-AULA-01',
        autor: 'Estudiante_#4491',
        puntuacion: 5,
        mobiliario: 5,
        equipos: 5,
        comentario: 'El Aula E es espaciosa y el data display tiene muy buena resolución. No hay problemas de iluminación.',
        fecha: '2026-03-05',
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'Aula 2A',
    piso: 'Piso 2',
    ubicacion: 'Edificio Central - Bloque A',
    capacidad: 60,
    estado: 'Moderado',
    puntuacionGeneral: 3.8,
    mobiliarioRating: 3.5,
    equiposRating: 4.2,
    ventilacionRating: 3.4,
    evaluacionesCount: 22,
    activos: [
      { nombre: 'Mobiliario (4 sillas desajustadas en fila 3)', ok: false },
      { nombre: 'Iluminación general operativa', ok: true },
      { nombre: 'Data Display operativo', ok: true }
    ],
    ecoReport: 'Foco del pasillo contiguo queda encendido',
    reportes: [],
    evaluaciones: [
      {
        id: 'REV-AULA-02',
        autor: 'Estudiante_#1190',
        puntuacion: 4,
        mobiliario: 3,
        equipos: 4,
        comentario: 'El aula es cómoda pero cuando hace calor le falta ventilación. Buen proyector.',
        fecha: '2026-03-07',
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'Aula 2C',
    piso: 'Piso 2',
    ubicacion: 'Edificio Central - Bloque A',
    capacidad: 55,
    estado: 'Óptimo',
    puntuacionGeneral: 4.7,
    mobiliarioRating: 4.8,
    equiposRating: 4.6,
    ventilacionRating: 4.7,
    evaluacionesCount: 15,
    activos: [
      { nombre: 'Pupitres en excelente estado', ok: true },
      { nombre: 'Tomas eléctricas con corriente', ok: true },
      { nombre: 'Ventilación adecuada', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula A',
    piso: 'Piso 1',
    ubicacion: 'Edificio Central - Bloque B',
    capacidad: 70,
    estado: 'Óptimo',
    puntuacionGeneral: 4.9,
    mobiliarioRating: 4.9,
    equiposRating: 4.9,
    ventilacionRating: 4.8,
    evaluacionesCount: 24,
    activos: [
      { nombre: 'Mobiliario acolchado excelente', ok: true },
      { nombre: 'Sistema de audio y proyector HDMI', ok: true },
      { nombre: 'Iluminación LED de bajo consumo', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula B',
    piso: 'Piso 1',
    ubicacion: 'Edificio Central - Bloque B',
    capacidad: 50,
    estado: 'Moderado',
    puntuacionGeneral: 3.6,
    mobiliarioRating: 3.4,
    equiposRating: 3.8,
    ventilacionRating: 3.7,
    evaluacionesCount: 14,
    activos: [
      { nombre: 'Mobiliario con desgaste notable', ok: false },
      { nombre: 'Tubo fluorescente titila periódicamente', ok: false }
    ],
    ecoReport: 'Tubo fluorescente parpadea y desperdicia energía',
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula C',
    piso: 'Piso 1',
    ubicacion: 'Edificio Central - Bloque B',
    capacidad: 55,
    estado: 'Óptimo',
    puntuacionGeneral: 4.6,
    mobiliarioRating: 4.5,
    equiposRating: 4.7,
    ventilacionRating: 4.5,
    evaluacionesCount: 16,
    activos: [
      { nombre: 'Pupitres firmes', ok: true },
      { nombre: 'Enchufes laterales funcionando', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula D',
    piso: 'Piso 1',
    ubicacion: 'Edificio Central - Bloque B',
    capacidad: 55,
    estado: 'Óptimo',
    puntuacionGeneral: 4.7,
    mobiliarioRating: 4.6,
    equiposRating: 4.8,
    ventilacionRating: 4.6,
    evaluacionesCount: 19,
    activos: [
      { nombre: 'Pizarra acrílica en buen estado', ok: true },
      { nombre: 'Iluminación uniforme', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula P1',
    piso: 'Piso 1',
    ubicacion: 'Pabellón de Aulas Nuevas',
    capacidad: 60,
    estado: 'Óptimo',
    puntuacionGeneral: 4.8,
    mobiliarioRating: 4.9,
    equiposRating: 4.8,
    ventilacionRating: 4.7,
    evaluacionesCount: 20,
    activos: [
      { nombre: 'Sillas ergonómicas nuevas', ok: true },
      { nombre: 'Tomas eléctricas accesibles', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula P2',
    piso: 'Piso 2',
    ubicacion: 'Pabellón de Aulas Nuevas',
    capacidad: 60,
    estado: 'Óptimo',
    puntuacionGeneral: 4.8,
    mobiliarioRating: 4.8,
    equiposRating: 4.9,
    ventilacionRating: 4.7,
    evaluacionesCount: 21,
    activos: [
      { nombre: 'Data display montado en techo', ok: true },
      { nombre: 'Mobiliario moderno', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Aula P3A',
    piso: 'Piso 3',
    ubicacion: 'Pabellón de Aulas Nuevas',
    capacidad: 50,
    estado: 'Moderado',
    puntuacionGeneral: 4.0,
    mobiliarioRating: 4.1,
    equiposRating: 3.8,
    ventilacionRating: 4.2,
    evaluacionesCount: 17,
    activos: [
      { nombre: 'Mobiliario operativo', ok: true },
      { nombre: 'Enchufe lateral no suministra energía', ok: false }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'P3B-LAB',
    piso: 'Piso 3',
    ubicacion: 'Pabellón Tecnológico / Laboratorios TIC',
    capacidad: 45,
    estado: 'Óptimo',
    puntuacionGeneral: 4.9,
    mobiliarioRating: 4.9,
    equiposRating: 5.0,
    ventilacionRating: 4.9,
    evaluacionesCount: 35,
    activos: [
      { nombre: '35 Computadoras con red gigabit y software', ok: true },
      { nombre: 'Climatización / Aire acondicionado', ok: true },
      { nombre: 'Proyector multimedia 4K', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: [
      {
        id: 'REV-AULA-03',
        autor: 'Estudiante_#7812',
        puntuacion: 5,
        mobiliario: 5,
        equipos: 5,
        comentario: 'El mejor laboratorio de la facultad. Las máquinas responden rápido y el ambiente es ideal para TIC III.',
        fecha: '2026-03-08',
        estado: 'Aprobado'
      }
    ]
  },
  {
    id: 'Aula P4',
    piso: 'Piso 4',
    ubicacion: 'Pabellón de Aulas Nuevas',
    capacidad: 65,
    estado: 'Óptimo',
    puntuacionGeneral: 4.6,
    mobiliarioRating: 4.7,
    equiposRating: 4.5,
    ventilacionRating: 4.7,
    evaluacionesCount: 16,
    activos: [
      { nombre: 'Mobiliario completo', ok: true },
      { nombre: 'Buena luz y ventilación natural', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'Pabellón F (PAB F)',
    piso: 'Planta Baja',
    ubicacion: 'Pabellón Posterior F',
    capacidad: 80,
    estado: 'Moderado',
    puntuacionGeneral: 3.9,
    mobiliarioRating: 4.0,
    equiposRating: 4.1,
    ventilacionRating: 3.7,
    evaluacionesCount: 25,
    activos: [
      { nombre: 'Mobiliario amplio', ok: true },
      { nombre: 'Gotera exterior requiere canalización', ok: false }
    ],
    ecoReport: 'Gotera exterior requiere canalización en época de lluvias',
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'LAB MONTES',
    piso: 'Planta Baja',
    ubicacion: 'Edificio Montes - Tecnológico',
    capacidad: 50,
    estado: 'Óptimo',
    puntuacionGeneral: 4.7,
    mobiliarioRating: 4.6,
    equiposRating: 4.8,
    ventilacionRating: 4.6,
    evaluacionesCount: 20,
    activos: [
      { nombre: 'Equipos informáticos para TIC', ok: true },
      { nombre: 'Conexión a internet UMSA', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  },
  {
    id: 'EX AUD',
    piso: 'Planta Baja',
    ubicacion: 'Ex Auditorio de la Carrera',
    capacidad: 120,
    estado: 'Óptimo',
    puntuacionGeneral: 4.7,
    mobiliarioRating: 4.8,
    equiposRating: 4.7,
    ventilacionRating: 4.5,
    evaluacionesCount: 28,
    activos: [
      { nombre: 'Butacas amplias y tarima', ok: true },
      { nombre: 'Sistema de audio central funcional', ok: true }
    ],
    ecoReport: null,
    reportes: [],
    evaluaciones: []
  }
];

// ============================================================================
// COLA DE MODERACIÓN Y APROBACIÓN EXCLUSIVA DEL ADMINISTRADOR (RF09, HU07)
// ============================================================================
let moderacionQueue = [
  {
    id: 'MOD-001',
    tipo: 'Docente',
    destinatario: 'HERETTHY QUISPE CLIVE',
    autorAnonimo: 'Estudiante_#9142',
    puntuacion: 5,
    claridad: 5,
    cumplimiento: 99,
    contenido: 'Muy buena metodología para TIC III. Enseña cómo diseñar sistemas orientados al usuario sin perderse en teoría.',
    motivo: 'Comentario nuevo pendiente de aprobación por el administrador',
    estado: 'Pendiente',
    fecha: '2026-03-14'
  },
  {
    id: 'MOD-002',
    tipo: 'Aula',
    destinatario: 'Aula 2A',
    autorAnonimo: 'Estudiante_#5521',
    puntuacion: 4,
    claridad: 4,
    cumplimiento: 0,
    contenido: 'Las sillas de la fila central se mueven un poco, pero el proyector funciona perfecto.',
    motivo: 'Comentario de infraestructura pendiente de aprobación',
    estado: 'Pendiente',
    fecha: '2026-03-14'
  }
];

// Matriz de Incidencias del Piloto (Fase 6.5)
let incidenciasPiloto = [
  { id: 'I01', incidencia: 'Aprobación de comentarios', modulo: 'Moderación', severidad: 'Alta', estado: 'Solucionado', solucion: 'Bandeja administrativa con control total para aprobar o descartar opiniones antes de publicarlas' },
  { id: 'I02', incidencia: 'Calificación de syllabus', modulo: 'Docentes', severidad: 'Media', estado: 'Solucionado', solucion: 'Control deslizante interactivo de 50% a 100% y cálculo de índice de claridad explicativa' },
  { id: 'I03', incidencia: 'Calificación de aulas', modulo: 'Sensor Aulas', severidad: 'Media', estado: 'Solucionado', solucion: 'Formulario multicriterio de mobiliario, equipos y ventilación con sensor ecológico' },
  { id: 'I04', incidencia: 'Consumo de datos móviles', modulo: 'Rendimiento', severidad: 'Baja', estado: 'Solucionado', solucion: 'Arquitectura ultra ligera en Vanilla JS sin frameworks pesados (< 5 MB)' }
];

// Registros de la Encuesta SUS
let susScores = [87.5, 90, 85, 92.5, 88.0];

// ============================================================================
// BANCO OFICIAL DE EXÁMENES PASADOS (UMSA • ADMINISTRACIÓN DE EMPRESAS)
// ============================================================================
const SAMPLE_PDF_DATA_URL = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4gZW5kb2JqCjIgMCBvYmogPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4gZW5kb2JqCjMgMCBvYmogPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4gZW5kb2JqCjQgMCBvYmogPDwgL0xlbmd0aCAyNjAgPj4gc3RyZWFtCkJUCi9GMSAxOCBUZgo1MCA3MjAgVGQKKFVOSVZFUlNJREFEIE1BWU9SIERFIFNBTiBBTkRSRVMgLSBVTVNBKSBUagowIC0yNCBUZAovRjEgMTMgVGYKKEZBQ1VMVEFEIERFIENJRU5DSUFTIEVDT05PTUlDQVMgWSBGSU5BTkNJRVJBUykgVGoKMCAtMjAgVGQKKENBUlJFUkEgREUgQURNSU5JU1RSQUNJT04gREUgRU1QUkVTQVMpIFRqCjAgLTMwIFRkCi9GMSAxNSBUZgooRVhBTUVOIEZJTkFMOiBUSUMtNzAzIFRJQyBJSUkpIFRqCjAgLTIyIFRkCi9GMSAxMSBUZgooRE9DRU5URSBUSVRVTEFSOiBMSUMuIENMSVZFIEhFUkVUVEhZIFFVSVNQRSAtIFNFTUVTVFJFIDdNTykgVGoKMCAtMzAgVGQKL0YxIDEyIFRmCigxLiBEaXNlP2UgZWwgTW9kZWxvIEJQTU4gZGUgQWRxdWlzaWNpb25lcyB5IENhZGVuYSBkZSBTdW1pbmlzdHJvLikgVGoKMCAtMjAgVGQKKDIuIFByb3BvbmdhIHVuYSBBcnF1aXRlY3R1cmEgZGUgSW50ZWdyYWNpb24gRVJQIHBhcmEgQmlnIERhdGEuKSBUagowIC0yMCBUZAooMy4gRm9ybXVsZSA0IEluZGljYWRvcmVzIENsYXZlIGRlIERlc2VtcGVubyBcKEtQSXNcKSBEaXJlY3Rpdm9zLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqIDw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PiBlbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ0IDAwMDAwIG4gCjAwMDAwMDA1NTcgMDAwMDAgbiAKdHJhaWxlciA8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo2MzYKJSVFT0Y=';

const SAMPLE_IMG_DATA_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f8fafc"/><rect x="20" y="20" width="760" height="560" fill="white" stroke="%23cbd5e1" stroke-width="2"/><text x="400" y="70" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="%230f2d59">UNIVERSIDAD MAYOR DE SAN ANDRES</text><text x="400" y="100" font-family="sans-serif" font-size="16" text-anchor="middle" fill="%23475569">FACULTAD DE CIENCIAS ECONOMICAS Y FINANCIERAS</text><text x="400" y="130" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="%232563eb">MAT-102 CALCULO I - EVALUACION PRACTICA</text><line x1="50" y1="150" x2="750" y2="150" stroke="%230f2d59" stroke-width="2"/><text x="60" y="190" font-family="serif" font-size="16" fill="%231e293b">Docente: Lic. Domingo Julio Perez Centellas | Aula: Aula E</text><text x="60" y="240" font-family="serif" font-size="16" font-weight="bold" fill="%230f2d59">1. Limites y Continuidad:</text><text x="80" y="270" font-family="monospace" font-size="15" fill="%23334155">lim(x-&gt;3) [(x^2 - 9) / (sqrt(x+1) - 2)] = 16</text><text x="60" y="320" font-family="serif" font-size="16" font-weight="bold" fill="%230f2d59">2. Costo Marginal e Ingreso Marginal:</text><text x="80" y="350" font-family="monospace" font-size="15" fill="%23334155">C(q) = 0.05q^3 - 0.4q^2 + 12q + 500  =&gt;  CMg = 0.15q^2 - 0.8q + 12</text><text x="60" y="400" font-family="serif" font-size="16" font-weight="bold" fill="%230f2d59">3. Grafica del Punto de Equilibrio y Derivadas:</text><rect x="80" y="420" width="640" height="110" fill="%23f1f5f9" stroke="%2394a3b8" rx="6"/><text x="400" y="480" font-family="sans-serif" font-size="14" text-anchor="middle" fill="%23059669">[ Hoja Oficial de Evaluacion Escaneada - Repositorio UMSA ]</text></svg>';

const defaultExamenes = [
  {
    id: 'EXAM-701',
    materia: 'TIC-703 TECNOLOGÍA DE LA INFORMACIÓN Y COMUNICACIÓN III',
    docente: 'HERETTHY QUISPE CLIVE',
    semestre: '7mo Semestre',
    gestion: 'II/2025',
    tipo: '1er Parcial',
    modalidad: 'Laboratorio / Práctico (P3B-LAB)',
    temas: 'Modelos de Procesos BPMN, Diagramas de Flujo de Datos, Big Data para Toma de Decisiones, Métricas de Usabilidad',
    preguntas: [
      '1. Describa y justifique la aplicación del estándar BPMN 2.0 en la automatización de procesos de compras para una mediana empresa comercial en La Paz.',
      '2. Diseñe el diagrama de arquitectura tecnológica de tres capas (Frontend, Backend, Base de Datos) para un sistema web que no supere los 5 MB de consumo por sesión.',
      '3. Explique cómo influye el análisis de Big Data en la reducción de costos operativos y optimización de la cadena de suministro en empresas del medio local.',
      '4. Caso Práctico: Una empresa distribuidora experimenta retrasos en la entrega de pedidos. Modele el flujo As-Is y plantee la propuesta To-Be optimizada.'
    ],
    fechaSubida: '2025-10-15',
    subidoPor: 'Estudiante_#9142',
    descargas: 48,
    archivoDataUrl: SAMPLE_PDF_DATA_URL,
    archivoNombre: 'Examen_Oficial_TIC_III_Lic_Heretthy.pdf',
    archivoTipo: 'application/pdf',
    archivoSize: 18400
  },
  {
    id: 'EXAM-101',
    materia: 'MAT-102 CÁLCULO',
    docente: 'PEREZ CENTELLAS DOMINGO JULIO',
    semestre: '1er Semestre',
    gestion: 'I/2025',
    tipo: '1er Parcial',
    modalidad: 'Presencial (Escrito - Aula E)',
    temas: 'Límites Algebraicos y Trigonométricos, Derivadas por Definición, Regla de la Cadena, Costo Marginal e Ingreso Marginal',
    preguntas: [
      '1. Calcule el límite: lim(x->3) [(x^2 - 9) / (sqrt(x+1) - 2)]. Demuestre paso a paso sin utilizar la regla de L\'Hopital.',
      '2. Halle la primera y segunda derivada de la función de producción f(x) = (3x^2 + 5x) / (2x - 1).',
      '3. La función de costo total de una empresa está dada por C(q) = 0.05q^3 - 0.4q^2 + 12q + 500. Encuentre la función de costo marginal y determine el nivel de producción donde el costo marginal es mínimo.',
      '4. Utilizando la regla de la cadena, derive y = ln[sqrt((1 + e^2x)/(1 - e^2x))].'
    ],
    fechaSubida: '2025-05-18',
    subidoPor: 'Estudiante_#6041',
    descargas: 62,
    archivoDataUrl: SAMPLE_IMG_DATA_URL,
    archivoNombre: 'Hoja_Examen_Calculo_Domingo_Perez.png',
    archivoTipo: 'image/png',
    archivoSize: 12500
  },
  {
    id: 'EXAM-102',
    materia: 'ADM-101 ADMINISTRACIÓN I',
    docente: 'ARRIETA CHUQUIMIA JUAN AURELIO',
    semestre: '1er Semestre',
    gestion: 'I/2025',
    tipo: '1er Parcial',
    modalidad: 'Presencial (Escrito - Aula E)',
    temas: 'Evolución del Pensamiento Administrativo, Escuela Clásica de Fayol, Escuela Científica de Taylor, Enfoque Humanístico de Elton Mayo',
    preguntas: [
      '1. Compare detalladamente los 14 principios de Henry Fayol con los principios de administración científica de Frederick Taylor.',
      '2. ¿Qué conclusiones fundamentales aportaron los experimentos de Hawthorne de Elton Mayo al comportamiento de los grupos en el trabajo?',
      '3. Explique los 4 pasos del proceso administrativo (Planear, Organizar, Dirigir, Controlar) y aplíquelos a una empresa fabricante de calzados en El Alto.',
      '4. Analice las ventajas y limitaciones de la estructura burocrática propuesta por Max Weber en organizaciones contemporáneas.'
    ],
    fechaSubida: '2025-04-20',
    subidoPor: 'Estudiante_#3819',
    descargas: 55
  },
  {
    id: 'EXAM-103',
    materia: 'FIN-103 CONTABILIDAD I',
    docente: 'ANCALLE CHOQUE DEMETRIO',
    semestre: '1er Semestre',
    gestion: 'II/2024',
    tipo: 'Examen Final',
    modalidad: 'Presencial (Práctico - Aula E)',
    temas: 'Ciclo Contable Completo, Asientos de Ajuste, Hoja de Trabajo de 10 Columnas, Balance General Clasificado, Estado de Resultados',
    preguntas: [
      '1. Con base en el Balance de Comprobación adjunto, efectúe los asientos de ajuste al 31 de diciembre por: depreciación de activos fijos (línea recta), previsión para cuentas incobrables y actualización por UFV.',
      '2. Elabore la Hoja de Trabajo de 10 columnas determinando el resultado de la gestión antes de impuestos.',
      '3. Confeccione el Estado de Resultados y el Balance General clasificado según normas contables bolivianas.',
      '4. Realice los asientos de cierre preparatorios y definitivos del ejercicio económico.'
    ],
    fechaSubida: '2024-11-28',
    subidoPor: 'Estudiante_#1902',
    descargas: 74
  },
  {
    id: 'EXAM-201',
    materia: 'MAT-205 INVESTIGACIÓN OPERATIVA I',
    docente: 'HERRERA CARDENAS FELIX ABRAHAM',
    semestre: '2do Semestre',
    gestion: 'II/2025',
    tipo: '1er Parcial',
    modalidad: 'Presencial (Práctico - Aula C)',
    temas: 'Programación Lineal, Formulación de Modelos Matemáticos, Método Gráfico, Método Simplex Primal y Tabla Óptima',
    preguntas: [
      '1. Formule el modelo de programación lineal para una empresa que fabrica 3 líneas de muebles sujeta a restricciones de horas-máquina, madera y demanda mínima.',
      '2. Resuelva mediante el Método Simplex tabular la maximización de Z = 50x1 + 80x2 sujeto a: 2x1 + 3x2 <= 120, x1 + 2x2 <= 70, x1, x2 >= 0.',
      '3. Interprete económicamente los precios sombra de los recursos y el intervalo de factibilidad de la solución óptima.',
      '4. Convierta el problema primal en su correspondiente modelo dual y verifique la relación de holgura complementaria.'
    ],
    fechaSubida: '2025-09-30',
    subidoPor: 'Estudiante_#9901',
    descargas: 81
  },
  {
    id: 'EXAM-301',
    materia: 'FIN-301 ADMINISTRACIÓN DE COSTOS I',
    docente: 'ANCALLE CHOQUE DEMETRIO',
    semestre: '3er Semestre',
    gestion: 'I/2025',
    tipo: '2do Parcial',
    modalidad: 'Presencial (Práctico - Aula D)',
    temas: 'Costos por Órdenes de Producción, Control de Materiales Directos, Mano de Obra, Distribución de Costos Indirectos (CIF)',
    preguntas: [
      '1. Calcule la tasa predeterminada de Costos Indirectos de Fabricación (CIF) utilizando horas de mano de obra directa como base de aplicación.',
      '2. Registre en el libro diario los movimientos de la Orden de Trabajo N° 45: compra y consumo de materia prima (PEPS), planilla de sueldos con cargas sociales y aplicación de CIF.',
      '3. Determine la sub o sobre-aplicación de CIF al final del período y efectúe el asiento de ajuste correspondiente.',
      '4. Calcule el punto de equilibrio en unidades físicas y monetarias para una estructura de costos fijos y variables dada.'
    ],
    fechaSubida: '2025-06-12',
    subidoPor: 'Estudiante_#1902',
    descargas: 53
  },
  {
    id: 'EXAM-501',
    materia: 'FIN-504 FINANZAS I',
    docente: 'ROCA CLADERA MICHAEL JOHNNY',
    semestre: '5to Semestre',
    gestion: 'II/2025',
    tipo: 'Examen Final',
    modalidad: 'Presencial (Práctico y Teórico - Aula P1)',
    temas: 'Valor del Dinero en el Tiempo, Valuación de Bonos y Acciones, Flujo de Caja Libre, Criterios VAN, TIR y Costo Promedio Ponderado WACC',
    preguntas: [
      '1. Una empresa evalúa dos proyectos mutuamente excluyentes (Proyecto Alfa y Beta) con vida útil de 5 años. Proyecte el Flujo de Caja Libre considerando depreciación, capital de trabajo e impuesto IUE (25%).',
      '2. Con una tasa de descuento (WACC) del 11.5%, calcule el Valor Actual Neto (VAN), la Tasa Interna de Retorno (TIR) y el Período de Recuperación Descontado.',
      '3. Valúe un bono corporativo con valor nominal de 10,000 Bs, tasa cupón del 7.5% anual pagadero semestralmente, a 8 años plazo, si la tasa de mercado exigida es del 9% anual.',
      '4. Explique el concepto de Costo de Capital Promedio Ponderado (WACC) y cómo se ve afectado por el escudo fiscal del financiamiento por deuda.'
    ],
    fechaSubida: '2025-11-20',
    subidoPor: 'Estudiante_#7110',
    descargas: 89
  },
  {
    id: 'EXAM-202',
    materia: 'ECO-207 MICROECONOMÍA',
    docente: 'ITURRALDE EGUEZ ALBERT ALEXANDER',
    semestre: '2do Semestre',
    gestion: 'I/2025',
    tipo: '2do Parcial',
    modalidad: 'Presencial (Escrito - Aula 2A)',
    temas: 'Teoría del Consumidor, Curvas de Indiferencia, Restricción Presupuestaria, Efecto Sustitución y Renta (Slutsky), Función Cobb-Douglas',
    preguntas: [
      '1. Dado un consumidor con función de utilidad U(x, y) = x^0.4 * y^0.6, ingreso I = 1,200 Bs, Px = 20 Bs y Py = 30 Bs, encuentre la canasta óptima de consumo.',
      '2. Si el precio del bien x sube a 40 Bs, descomponga la variación total en Efecto Sustitución y Efecto Renta según Slutsky.',
      '3. Grafique el equilibrio inicial, el equilibrio final y la línea presupuestaria compensada.',
      '4. Para la función de producción Q = 10 * K^0.5 * L^0.5, determine el tipo de rendimientos a escala y la Tasa Marginal de Sustitución Técnica.'
    ],
    fechaSubida: '2025-05-24',
    subidoPor: 'Estudiante_#8812',
    descargas: 67
  },
  {
    id: 'EXAM-104',
    materia: 'CJS-104 DERECHO CONSTITUCIONAL',
    docente: 'PEREZ SANCHEZ VIERKA VIVIANA',
    semestre: '1er Semestre',
    gestion: 'II/2025',
    tipo: '1er Parcial',
    modalidad: 'Presencial (Escrito - Aula 2A)',
    temas: 'Principios Constitucionales, Derechos Fundamentales, Ley General del Trabajo Boliviana y Contratos Laborales',
    preguntas: [
      '1. Explique los principios constitucionales de primacía de la realidad, in dubio pro operario y no discriminación en las relaciones laborales.',
      '2. Detalle los elementos esenciales de un contrato individual de trabajo según la Ley General del Trabajo boliviana y sus efectos jurídicos.',
      '3. ¿Cuáles son las causales justificadas de despido según el artículo 16 de la L.G.T. y qué procedimientos probatorios exige la ley?',
      '4. Caso práctico: Un trabajador con 6 años de antigüedad es despedido sin causa justificada. Calcule el desahucio e indemnización según el D.S. 28699.'
    ],
    fechaSubida: '2025-09-18',
    subidoPor: 'Estudiante_#7743',
    descargas: 42
  },
  {
    id: 'EXAM-302',
    materia: 'ADM-303 EMPRENDIMIENTO',
    docente: 'RIVEROS NAVA PABLO DANIEL',
    semestre: '3er Semestre',
    gestion: 'II/2025',
    tipo: 'Examen Final',
    modalidad: 'Caso de Negocio / Proyecto (Aula P2)',
    temas: 'Metodología Lean Startup, Lienzo Business Model CANVAS, Propuesta de Valor, Producto Mínimo Viable (PMV) y Pitch',
    preguntas: [
      '1. Diseñe el Lienzo CANVAS completo para un emprendimiento de base tecnológica en La Paz, detallando los 9 bloques estratégicos.',
      '2. Defina con precisión el mapa de empatía y el Canvas de la Propuesta de Valor del cliente objetivo.',
      '3. Explique el ciclo Construir-Medir-Aprender y formule 3 hipótesis críticas que deben validarse antes del lanzamiento de un PMV.',
      '4. Elabore la estructura de un Pitch de Inversión de 3 minutos orientado a captar financiamiento semilla de incubadoras universitarias.'
    ],
    fechaSubida: '2025-11-14',
    subidoPor: 'Estudiante_#2109',
    descargas: 58
  }
];

// ============================================================================
// GESTIÓN DE ALMACENAMIENTO LOCAL (PERSISTENCIA)
// ============================================================================
function loadStorage() {
  const savedDocentes = localStorage.getItem('ranking_cae_docentes_v3');
  const savedAulas = localStorage.getItem('ranking_cae_aulas_v3');
  const savedQueue = localStorage.getItem('ranking_cae_modqueue_v3');
  const savedIncidencias = localStorage.getItem('ranking_cae_incidencias_v3');
  const savedSus = localStorage.getItem('ranking_cae_sus_v3');
  const savedExamenes = localStorage.getItem('ranking_cae_examenes_v3');
  const savedUserVotes = localStorage.getItem('ranking_cae_user_votes_v3');
  const savedUserAulaVotes = localStorage.getItem('ranking_cae_user_aula_votes_v3');

  if (!savedDocentes) localStorage.setItem('ranking_cae_docentes_v3', JSON.stringify(defaultDocentes));
  if (!savedAulas) localStorage.setItem('ranking_cae_aulas_v3', JSON.stringify(defaultAulas));
  if (!savedQueue) localStorage.setItem('ranking_cae_modqueue_v3', JSON.stringify(moderacionQueue));
  if (!savedIncidencias) localStorage.setItem('ranking_cae_incidencias_v3', JSON.stringify(incidenciasPiloto));
  if (!savedSus) localStorage.setItem('ranking_cae_sus_v3', JSON.stringify(susScores));
  if (!savedExamenes) localStorage.setItem('ranking_cae_examenes_v3', JSON.stringify(defaultExamenes));
  if (!savedUserVotes) localStorage.setItem('ranking_cae_user_votes_v3', JSON.stringify({}));
  if (!savedUserAulaVotes) localStorage.setItem('ranking_cae_user_aula_votes_v3', JSON.stringify({}));
}

function getDocentes() {
  return JSON.parse(localStorage.getItem('ranking_cae_docentes_v3')) || defaultDocentes;
}

function saveDocentes(list) {
  localStorage.setItem('ranking_cae_docentes_v3', JSON.stringify(list));
  trackDataConsumption(2.2);
}

function getAulas() {
  return JSON.parse(localStorage.getItem('ranking_cae_aulas_v3')) || defaultAulas;
}

function saveAulas(list) {
  localStorage.setItem('ranking_cae_aulas_v3', JSON.stringify(list));
  trackDataConsumption(1.6);
}

function getExamenes() {
  let list = null;
  try {
    list = JSON.parse(localStorage.getItem('ranking_cae_examenes_v4'));
  } catch (e) {}

  if (!list) {
    try {
      list = JSON.parse(localStorage.getItem('ranking_cae_examenes_v3'));
    } catch (e) {}

    if (!list || !Array.isArray(list) || list.length === 0) {
      list = defaultExamenes;
    } else {
      // Si el examen EXAM-701 no tenía archivo, vincularle el PDF muestra
      const e701 = list.find(e => e.id === 'EXAM-701');
      if (e701 && !e701.archivoDataUrl) {
        e701.archivoDataUrl = SAMPLE_PDF_DATA_URL;
        e701.archivoNombre = 'Examen_Oficial_TIC_III_Lic_Heretthy.pdf';
        e701.archivoTipo = 'application/pdf';
        e701.archivoSize = 18400;
      }
      const e101 = list.find(e => e.id === 'EXAM-101');
      if (e101 && !e101.archivoDataUrl) {
        e101.archivoDataUrl = SAMPLE_IMG_DATA_URL;
        e101.archivoNombre = 'Hoja_Examen_Calculo_Domingo_Perez.png';
        e101.archivoTipo = 'image/png';
        e101.archivoSize = 12500;
      }
    }
    try {
      localStorage.setItem('ranking_cae_examenes_v4', JSON.stringify(list));
    } catch (e) {}
  }
  return list;
}

function saveExamenes(list) {
  try {
    localStorage.setItem('ranking_cae_examenes_v4', JSON.stringify(list));
    localStorage.setItem('ranking_cae_examenes_v3', JSON.stringify(list));
    trackDataConsumption(1.8);
  } catch (err) {
    console.warn('Storage limit reached', err);
    showNotification('⚠️ Almacenamiento local lleno. El archivo es muy pesado.', 'warning');
  }
}

function getUserVotes() {
  return JSON.parse(localStorage.getItem('ranking_cae_user_votes_v3')) || {};
}

function saveUserVotes(votes) {
  localStorage.setItem('ranking_cae_user_votes_v3', JSON.stringify(votes));
}

function getUserAulaVotes() {
  return JSON.parse(localStorage.getItem('ranking_cae_user_aula_votes_v3')) || {};
}

function saveUserAulaVotes(votes) {
  localStorage.setItem('ranking_cae_user_aula_votes_v3', JSON.stringify(votes));
}

function getModeracionQueue() {
  return JSON.parse(localStorage.getItem('ranking_cae_modqueue_v3')) || moderacionQueue;
}

function saveModeracionQueue(q) {
  localStorage.setItem('ranking_cae_modqueue_v3', JSON.stringify(q));
}

function getIncidencias() {
  return JSON.parse(localStorage.getItem('ranking_cae_incidencias_v3')) || incidenciasPiloto;
}

function saveIncidencias(inc) {
  localStorage.setItem('ranking_cae_incidencias_v3', JSON.stringify(inc));
}

function getSusList() {
  return JSON.parse(localStorage.getItem('ranking_cae_sus_v3')) || susScores;
}

function saveSusList(s) {
  localStorage.setItem('ranking_cae_sus_v3', JSON.stringify(s));
}

function trackDataConsumption(kbytes) {
  sessionDataConsumedKB += kbytes;
  const mb = (sessionDataConsumedKB / 1024).toFixed(2);
  const badgeEl = document.getElementById('data-meter-text');
  if (badgeEl) badgeEl.textContent = `${mb} MB / 5.0 MB`;
}

function containsOffensiveWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  for (let word of BANNED_WORDS) {
    if (lower.includes(word)) return word;
  }
  return false;
}

// ============================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  initNavigation();
  initRoleAndAuth();
  initRatingStarInputs();
  renderDocentes();
  renderAulas();
  renderExamenes();
  initExamenesListeners();
  initAdminModals();
  populateSubirMateriaDocenteSelects();
  renderComentariosWall();
  populateCommentDocenteSelect();
  renderAdminDashboard();
  renderSusSurvey();
  updatePendingBadge();
  trackDataConsumption(0);
});

// Navegación
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const navContainer = document.querySelector('.nav-container');

  // Permitir desplazamiento horizontal intuitivo con la rueda del ratón en la barra de pestañas
  if (navContainer) {
    navContainer.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        navContainer.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Seguridad: Proteger la pestaña admin si se intenta acceder en modo estudiante
      if (targetId === 'sec-admin' && currentUser.role !== 'admin') {
        showNotification('⚠️ La pestaña de Aprobación & Moderación es exclusiva para el Administrador.', 'warning');
        return;
      }

      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Asegurar que la pestaña activa sea visible en la barra con scroll
      btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

      document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
      
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (targetId === 'sec-admin') {
        renderAdminDashboard();
      } else if (targetId === 'sec-comentarios') {
        renderComentariosWall();
      } else if (targetId === 'sec-examenes') {
        renderExamenes();
      }
      trackDataConsumption(0.4);
    });
  });
}

// Control de Rol: Estudiante (Público) vs Administrador (Tú)
function initRoleAndAuth() {
  const authPill = document.getElementById('auth-pill');
  if (authPill) {
    updateAuthDisplay();
    authPill.addEventListener('click', toggleUserRole);
  }

  const btnSwitchMode = document.getElementById('btn-switch-mode');
  if (btnSwitchMode) {
    btnSwitchMode.addEventListener('click', toggleUserRole);
  }
}

function toggleUserRole() {
  currentUser.role = currentUser.role === 'estudiante' ? 'admin' : 'estudiante';
  updateAuthDisplay();
  renderDocentes();
  renderAulas();
  renderAdminDashboard();

  if (currentUser.role === 'admin') {
    showNotification('👑 MODO ADMINISTRADOR ACTIVADO: Ahora tienes el control para aprobar/rechazar comentarios y modificar calificaciones.', 'info');
    // Ir directamente al panel de moderación
    const adminBtn = document.getElementById('tab-admin');
    if (adminBtn) adminBtn.click();
  } else {
    showNotification('👤 Modo Estudiante (Público) activado.', 'info');
    // Si estaba activa la pestaña de administración, redirigir inmediatamente a docentes
    const secAdmin = document.getElementById('sec-admin');
    if (secAdmin && secAdmin.classList.contains('active')) {
      const docBtn = document.querySelector('.nav-btn[data-target="sec-docentes"]');
      if (docBtn) docBtn.click();
    }
  }
}

function updateAuthDisplay() {
  const authText = document.getElementById('auth-pill-text');
  const adminBanner = document.getElementById('admin-top-banner');
  const tabAdmin = document.getElementById('tab-admin');

  if (authText) {
    authText.textContent = currentUser.role === 'admin' 
      ? `👑 Administrador (Tú)` 
      : `👤 Estudiante (${currentUser.token})`;
  }

  if (adminBanner) {
    adminBanner.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
  }

  // La pestaña de Aprobación & Moderación SOLO es visible en modo Administrador
  if (tabAdmin) {
    tabAdmin.style.display = currentUser.role === 'admin' ? 'inline-flex' : 'none';
  }

  updatePendingBadge();
}

function updatePendingBadge() {
  const queue = getModeracionQueue();
  const pendingCount = queue.filter(q => q.estado === 'Pendiente').length;
  const badges = document.querySelectorAll('.pending-comments-counter');
  badges.forEach(b => {
    b.textContent = pendingCount > 0 ? `(${pendingCount} por aprobar)` : '';
    b.style.display = pendingCount > 0 ? 'inline-block' : 'none';
  });
}

// ============================================================================
// CONFIGURACIÓN DE INPUTS DE ESTRELLAS Y SLIDERS INTERACTIVOS
// ============================================================================
function initRatingStarInputs() {
  document.querySelectorAll('.star-rating-input').forEach(container => {
    const inputId = container.getAttribute('data-input-id');
    const hiddenInput = document.getElementById(inputId);
    const stars = container.querySelectorAll('.star');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'), 10);
        if (hiddenInput) hiddenInput.value = val;
        stars.forEach((s, idx) => {
          if (idx < val) s.classList.add('active');
          else s.classList.remove('active');
        });
      });
    });
  });

  // Slider de Cumplimiento de Syllabus con valor en tiempo real
  const syllabusSlider = document.getElementById('eval-doc-syllabus-slider');
  const syllabusBadge = document.getElementById('eval-doc-syllabus-badge');
  if (syllabusSlider && syllabusBadge) {
    syllabusSlider.addEventListener('input', () => {
      syllabusBadge.textContent = `${syllabusSlider.value}%`;
    });
  }
}

function setStarInputValues(containerId, inputId, val) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(inputId);
  if (!container) return;
  if (hiddenInput) hiddenInput.value = val;
  const stars = container.querySelectorAll('.star');
  stars.forEach((s, idx) => {
    if (idx < val) s.classList.add('active');
    else s.classList.remove('active');
  });
}

// ============================================================================
// MÓDULO 1: DOCENTES (CALIFICACIÓN DE CALIDAD Y SYLLABUS)
// ============================================================================
function renderDocentes() {
  const grid = document.getElementById('docentes-grid');
  const searchInput = document.getElementById('search-docente');
  const filterSemestre = document.getElementById('filter-semestre');
  const filterAula = document.getElementById('filter-aula-doc');
  const sortOrder = document.getElementById('sort-docentes');

  if (!grid) return;

  const docentes = getDocentes();
  const userVotes = getUserVotes();
  const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
  const semVal = (filterSemestre ? filterSemestre.value : '');
  const aulaVal = (filterAula ? filterAula.value : '');
  const sortVal = (sortOrder ? sortOrder.value : 'puntuacion-desc');

  let filtered = docentes.filter(doc => {
    const matchQuery = doc.nombre.toLowerCase().includes(query) || 
                       doc.asignatura.toLowerCase().includes(query) ||
                       doc.aula.toLowerCase().includes(query) ||
                       doc.semestre.toLowerCase().includes(query);
    const matchSem = !semVal || doc.semestre.toLowerCase().includes(semVal.toLowerCase());
    const matchAula = !aulaVal || doc.aula.toLowerCase().includes(aulaVal.toLowerCase());
    return matchQuery && matchSem && matchAula;
  });

  filtered.sort((a, b) => {
    if (sortVal === 'puntuacion-desc') return b.puntuacionGeneral - a.puntuacionGeneral;
    if (sortVal === 'claridad-desc') return b.indiceClaridad - a.indiceClaridad;
    if (sortVal === 'cumplimiento-desc') return b.cumplimientoPrograma - a.cumplimientoPrograma;
    if (sortVal === 'evals-desc') return b.evaluacionesCount - a.evaluacionesCount;
    if (sortVal === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  const countBadge = document.getElementById('docentes-count-badge');
  if (countBadge) countBadge.textContent = `Mostrando ${filtered.length} de ${docentes.length} docentes oficiales`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--border);">
        <p style="font-size: 1.1rem; color: var(--text-muted);">No se encontraron docentes con esos criterios.</p>
        <button class="btn btn-secondary btn-sm" style="margin-top: 1rem;" onclick="resetDocenteFilters()">Restablecer Búsqueda</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((doc) => {
    const tagsHtml = doc.metodologia.map(m => `<span class="badge-tag">${m}</span>`).join('');

    // Comentarios aprobados
    const approvedReviews = (doc.evaluaciones || []).filter(e => e.estado === 'Aprobado');

    // Voto registrado por el usuario actual
    const userVoteKey = `${currentUser.token}_${doc.id}`;
    const userVote = userVotes[userVoteKey];
    const userVoteHtml = userVote ? `
      <div class="user-voted-chip">
        <span>⭐ <strong>Tu calificación:</strong> ${userVote.puntuacionGeneral}/5 • Claridad: ${userVote.claridadRating}/5 • Syllabus: ${userVote.syllabusPercent}%</span>
        <span style="font-size: 0.72rem; color: #047857; font-weight: 700;">✔️ Registrado</span>
      </div>
    ` : '';

    const rateBtnText = userVote ? '✏️ Modificar mi Calificación' : '⭐ Calificar Docente';

    const adminEditBtnHtml = (currentUser.role === 'admin') ? `
      <button class="btn btn-admin-edit btn-sm" style="width: 100%; margin-top: 0.4rem; font-weight: 700;" onclick="openAdminEditDocenteModal('${doc.id}')">
        👑 Modificar Calificaciones / Datos (Admin)
      </button>
    ` : '';

    return `
      <div class="docente-card">
        <div class="docente-card-header">
          <div style="flex: 1;">
            <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.25rem;">
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--secondary); background: #fef3c7; padding: 0.15rem 0.45rem; border-radius: 4px;">
                ${doc.semestre}
              </span>
            </div>
            <h3 class="docente-name" style="font-size: 1rem;">${doc.nombre}</h3>
            <div class="docente-subject">
              <span>📚 <strong>Materia:</strong> ${doc.asignatura}</span>
            </div>
            <div style="margin-top: 0.35rem; font-size: 0.82rem; color: #065f46; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">
              <span>🏫 <strong>Aula(s) Asignada(s):</strong></span>
              <span class="badge-tag" style="background: #d1fae5; color: #065f46; font-weight: 700;">${doc.aula}</span>
            </div>
          </div>
          <div class="rating-badge" title="Puntuación General">
            <span>⭐ ${doc.puntuacionGeneral.toFixed(1)}</span>
          </div>
        </div>

        ${userVoteHtml}

        <!-- Indicadores Centrales: Calidad y Syllabus -->
        <div class="metrics-row">
          <div class="metric-item">
            <span class="metric-label">Índice de Calidad / Claridad</span>
            <span class="metric-value">🎯 ${doc.indiceClaridad.toFixed(1)} / 5.0</span>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${(doc.indiceClaridad / 5) * 100}%; background-color: #3b82f6;"></div>
            </div>
          </div>
          <div class="metric-item">
            <span class="metric-label">Avance del Syllabus (Programa)</span>
            <span class="metric-value">📋 ${doc.cumplimientoPrograma}%</span>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: ${doc.cumplimientoPrograma}%; background-color: #10b981;"></div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 0.5rem;">
          <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.25rem;">METODOLOGÍA:</span>
          <div class="methodology-tags">
            ${tagsHtml}
          </div>
        </div>

        <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.85rem;">
          ${doc.descripcion}
        </p>

        <!-- Botones de Acción: Calificar Calidad y Syllabus como función principal -->
        <div class="docente-card-footer">
          <button class="btn btn-primary btn-sm" style="flex: 1.2; font-weight: 700;" onclick="openCalificarDocenteModal('${doc.id}')">
            ${rateBtnText}
          </button>
          <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="openDocenteDetailModal('${doc.id}')">
            🔍 Ver Opiniones (${approvedReviews.length})
          </button>
        </div>

        ${adminEditBtnHtml}
      </div>
    `;
  }).join('');
}

const searchDocInput = document.getElementById('search-docente');
if (searchDocInput) searchDocInput.addEventListener('input', () => { renderDocentes(); trackDataConsumption(0.1); });

const filterSemestreSelect = document.getElementById('filter-semestre');
if (filterSemestreSelect) filterSemestreSelect.addEventListener('change', renderDocentes);

const filterAulaDocSelect = document.getElementById('filter-aula-doc');
if (filterAulaDocSelect) filterAulaDocSelect.addEventListener('change', renderDocentes);

const sortDocentesSelect = document.getElementById('sort-docentes');
if (sortDocentesSelect) sortDocentesSelect.addEventListener('change', renderDocentes);

function resetDocenteFilters() {
  if (searchDocInput) searchDocInput.value = '';
  if (filterSemestreSelect) filterSemestreSelect.value = '';
  if (filterAulaDocSelect) filterAulaDocSelect.value = '';
  if (sortDocentesSelect) sortDocentesSelect.value = 'puntuacion-desc';
  renderDocentes();
}

// Modal de Calificación de Docente (Calidad, Syllabus y Comentario Opcional)
let activeRateDocId = null;

function openCalificarDocenteModal(docId) {
  const docentes = getDocentes();
  const doc = docentes.find(d => d.id === docId);
  if (!doc) return;

  activeRateDocId = docId;
  const userVotes = getUserVotes();
  const userVoteKey = `${currentUser.token}_${docId}`;
  const existingVote = userVotes[userVoteKey];

  const titleEl = document.getElementById('eval-doc-title-name');
  const subEl = document.getElementById('eval-doc-subtitle-materia');
  const submitBtn = document.querySelector('#form-calificar-docente button[type="submit"]');

  if (existingVote) {
    if (titleEl) titleEl.textContent = `✏️ Modificar Calificación: ${doc.nombre}`;
    if (subEl) subEl.textContent = `Modifica tu valoración anterior (Calidad: ${existingVote.claridadRating}★, Syllabus: ${existingVote.syllabusPercent}%)`;
    if (submitBtn) submitBtn.textContent = '💾 Actualizar mi Calificación';

    setStarInputValues('stars-eval-doc-general', 'input-eval-doc-general', existingVote.puntuacionGeneral);
    setStarInputValues('stars-eval-doc-claridad', 'input-eval-doc-claridad', existingVote.claridadRating);

    const slider = document.getElementById('eval-doc-syllabus-slider');
    const badge = document.getElementById('eval-doc-syllabus-badge');
    if (slider) slider.value = existingVote.syllabusPercent;
    if (badge) badge.textContent = `${existingVote.syllabusPercent}%`;

    const metodoSelect = document.getElementById('eval-doc-metodologia');
    if (metodoSelect && existingVote.metodologia) metodoSelect.value = existingVote.metodologia;
  } else {
    if (titleEl) titleEl.textContent = `⭐ Calificar Docente: ${doc.nombre}`;
    if (subEl) subEl.textContent = `Asignatura: ${doc.asignatura} • Aula: ${doc.aula}`;
    if (submitBtn) submitBtn.textContent = 'Registrar Calificación';

    const initGen = Math.round(doc.puntuacionGeneral || 5);
    const initClar = Math.round(doc.indiceClaridad || 5);
    const initSyll = doc.cumplimientoPrograma || 95;

    setStarInputValues('stars-eval-doc-general', 'input-eval-doc-general', initGen);
    setStarInputValues('stars-eval-doc-claridad', 'input-eval-doc-claridad', initClar);

    const slider = document.getElementById('eval-doc-syllabus-slider');
    const badge = document.getElementById('eval-doc-syllabus-badge');
    if (slider) slider.value = initSyll;
    if (badge) badge.textContent = `${initSyll}%`;
  }

  const commentInput = document.getElementById('eval-doc-comentario');
  if (commentInput) commentInput.value = '';

  openModal('modal-calificar-docente');
}

// Procesar Calificación de Docente
const formCalificarDocente = document.getElementById('form-calificar-docente');
if (formCalificarDocente) {
  formCalificarDocente.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeRateDocId) return;

    const generalRating = parseFloat(document.getElementById('input-eval-doc-general').value) || 5;
    const claridadRating = parseFloat(document.getElementById('input-eval-doc-claridad').value) || 5;
    const syllabusPercent = parseInt(document.getElementById('eval-doc-syllabus-slider').value, 10) || 95;
    const metodologia = document.getElementById('eval-doc-metodologia').value;
    const comentario = document.getElementById('eval-doc-comentario').value.trim();

    const docentes = getDocentes();
    const docIdx = docentes.findIndex(d => d.id === activeRateDocId);
    if (docIdx === -1) return;

    const userVotes = getUserVotes();
    const userVoteKey = `${currentUser.token}_${activeRateDocId}`;
    const existingVote = userVotes[userVoteKey];

    // Actualización DIRECTA e inmediata para que cualquier cambio o modificación sea 100% visible
    docentes[docIdx].puntuacionGeneral = parseFloat(generalRating.toFixed(1));
    docentes[docIdx].indiceClaridad = parseFloat(claridadRating.toFixed(1));
    docentes[docIdx].cumplimientoPrograma = syllabusPercent;
    if (!existingVote) {
      docentes[docIdx].evaluacionesCount = (docentes[docIdx].evaluacionesCount || 0) + 1;
    }

    userVotes[userVoteKey] = {
      puntuacionGeneral: generalRating,
      claridadRating: claridadRating,
      syllabusPercent: syllabusPercent,
      metodologia: metodologia,
      fecha: new Date().toISOString().split('T')[0]
    };
    saveUserVotes(userVotes);

    if (!docentes[docIdx].metodologia.includes(metodologia)) {
      docentes[docIdx].metodologia.push(metodologia);
    }

    // Si el estudiante escribió un comentario de texto, SE ENVÍA A APROBACIÓN DEL ADMIN
    if (comentario) {
      const offensive = containsOffensiveWords(comentario);
      const queue = getModeracionQueue();
      const newSubmission = {
        id: 'MOD-' + Date.now().toString().slice(-4),
        tipo: 'Docente',
        destinatario: docentes[docIdx].nombre,
        docenteId: docentes[docIdx].id,
        materia: docentes[docIdx].asignatura,
        autorAnonimo: `Estudiante_#${currentUser.token.replace('EST-UMSA-', '')}`,
        puntuacion: generalRating,
        claridad: claridadRating,
        cumplimiento: syllabusPercent,
        contenido: comentario,
        motivo: offensive ? `⚠️ Alerta: contiene palabra sensible ("${offensive}")` : 'Pendiente de aprobación administrativa',
        estado: 'Pendiente',
        fecha: new Date().toISOString().split('T')[0]
      };
      queue.unshift(newSubmission);
      saveModeracionQueue(queue);

      showNotification('💬 Tu comentario escrito fue enviado a la bandeja del Administrador para su aprobación antes de publicarse.', 'info');
    }

    saveDocentes(docentes);
    closeModal('modal-calificar-docente');
    renderDocentes();
    renderAdminDashboard();

    const notifMsg = existingVote
      ? `✏️ ¡Calificación modificada con éxito! Calidad: ${claridadRating}★ • Syllabus: ${syllabusPercent}% • General: ${generalRating}★`
      : `✅ ¡Calificación registrada con éxito! Calidad: ${claridadRating}★ • Syllabus: ${syllabusPercent}% • General: ${generalRating}★`;
    showNotification(notifMsg, 'success');
  });
}

// Modal Perfil Detallado de Docente (Solo muestra comentarios APROBADOS)
function openDocenteDetailModal(docId) {
  const docentes = getDocentes();
  const doc = docentes.find(d => d.id === docId);
  if (!doc) return;

  const modalBody = document.getElementById('docente-modal-content');
  const modalTitle = document.getElementById('docente-modal-title');
  if (modalTitle) modalTitle.textContent = `${doc.nombre}`;

  const approvedReviews = (doc.evaluaciones || []).filter(e => e.estado === 'Aprobado');

  const reviewsHtml = approvedReviews.length > 0
    ? approvedReviews.map(ev => `
        <div style="border-bottom: 1px solid var(--border); padding: 0.85rem 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">
              🛡️ ${ev.autor || 'Estudiante Anónimo'}
            </span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #b45309;">⭐ ${ev.puntuacion} / 5</span>
          </div>
          <p style="font-size: 0.84rem; color: var(--text-main); margin-bottom: 0.35rem;">"${ev.comentario}"</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted);">
            <span>Claridad: <strong>${ev.claridad || 5}/5</strong> • Syllabus: <strong>${ev.cumplimiento || 95}%</strong></span>
            <span style="color: #059669; font-weight: 600;">✔️ Comentario Aprobado</span>
          </div>
        </div>
      `).join('')
    : '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 1rem 0;">Aún no hay opiniones de texto aprobadas. ¡Haz clic en "Calificar Docente" para ser el primero!</p>';

  if (modalBody) {
    modalBody.innerHTML = `
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.25rem;">
        <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary);">${doc.nombre}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.35rem;">📚 ${doc.asignatura} • ${doc.semestre}</div>
        <div style="font-size: 0.85rem; color: #065f46; font-weight: 600; margin-bottom: 0.6rem;">🏫 Aula Asignada: <strong>${doc.aula}</strong></div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div><span style="font-size: 0.72rem; color: var(--text-muted);">VALORACIÓN GENERAL:</span> <strong style="color:#b45309;">⭐ ${doc.puntuacionGeneral.toFixed(1)} / 5</strong></div>
          <div><span style="font-size: 0.72rem; color: var(--text-muted);">ÍNDICE DE CALIDAD:</span> <strong style="color:#2563eb;">🎯 ${doc.indiceClaridad.toFixed(1)} / 5</strong></div>
          <div><span style="font-size: 0.72rem; color: var(--text-muted);">AVANCE SYLLABUS:</span> <strong style="color:#15803d;">📋 ${doc.cumplimientoPrograma}%</strong></div>
        </div>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h4 style="font-size: 0.92rem; color: var(--primary);">
            Comentarios Aprobados de la Comunidad (${approvedReviews.length})
          </h4>
          <button class="btn btn-primary btn-sm" onclick="closeModal('modal-docente-detail'); openCalificarDocenteModal('${doc.id}');">
            ⭐ Calificar Docente
          </button>
        </div>
        <div style="max-height: 250px; overflow-y: auto;">
          ${reviewsHtml}
        </div>
      </div>
    `;
  }

  openModal('modal-docente-detail');
  trackDataConsumption(0.6);
}

// ============================================================================
// MÓDULO 2: AULAS (CALIFICACIÓN FÍSICA Y SENSOR DE CONDICIONES)
// ============================================================================
function renderAulas() {
  const grid = document.getElementById('aulas-grid');
  const searchInput = document.getElementById('search-aula');
  const filterPiso = document.getElementById('filter-piso');
  const filterEstado = document.getElementById('filter-estado');

  if (!grid) return;

  const aulas = getAulas();
  const userAulaVotes = getUserAulaVotes();
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const pisoVal = filterPiso ? filterPiso.value : '';
  const estadoVal = filterEstado ? filterEstado.value : '';

  let filtered = aulas.filter(aula => {
    const matchQuery = aula.id.toLowerCase().includes(query) || aula.ubicacion.toLowerCase().includes(query);
    const matchPiso = !pisoVal || aula.piso === pisoVal;
    const matchEstado = !estadoVal || aula.estado === estadoVal;
    return matchQuery && matchPiso && matchEstado;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--border);">
        <p style="font-size: 1.1rem; color: var(--text-muted);">No se encontraron aulas con los criterios seleccionados.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(aula => {
    let statusClass = 'status-optimo';
    if (aula.estado === 'Moderado') statusClass = 'status-moderado';
    if (aula.estado === 'Crítico') statusClass = 'status-critico';

    const equipmentHtml = aula.activos.map(act => `
      <li class="aula-equipment-item ${act.ok ? 'ok' : 'issue'}">
        <span>${act.ok ? '✔️' : '⚠️'}</span>
        <span>${act.nombre}</span>
      </li>
    `).join('');

    const ecoHtml = aula.ecoReport ? `
      <div class="eco-alert-banner">
        <span>🌱 <strong>Sensor Ecológico:</strong> ${aula.ecoReport}</span>
      </div>
    ` : '';

    const userVoteKey = `${currentUser.token}_${aula.id}`;
    const userVote = userAulaVotes[userVoteKey];
    const userVoteHtml = userVote ? `
      <div class="user-voted-chip">
        <span>⭐ <strong>Tu calificación:</strong> Mobiliario ${userVote.mobRating}/5 • Equipos ${userVote.eqRating}/5 • Ventilación ${userVote.ventRating}/5</span>
        <span style="font-size: 0.72rem; color: #047857; font-weight: 700;">✔️ Registrado</span>
      </div>
    ` : '';

    const rateBtnText = userVote ? '✏️ Modificar Calificación' : '⭐ Calificar Aula';

    const adminEditBtnHtml = (currentUser.role === 'admin') ? `
      <button class="btn btn-admin-edit btn-sm" style="width: 100%; margin-top: 0.4rem; font-weight: 700;" onclick="openAdminEditAulaModal('${aula.id}')">
        👑 Modificar Aula (Admin)
      </button>
    ` : '';

    return `
      <div class="aula-card">
        <div class="aula-header">
          <div>
            <h3 class="aula-id-title">${aula.id}</h3>
            <span class="aula-location">📍 ${aula.ubicacion} • ${aula.piso} (Capacidad: ~${aula.capacidad})</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="rating-badge" title="Puntuación General">⭐ ${(aula.puntuacionGeneral || 4.5).toFixed(1)}</span>
            <span class="status-pill ${statusClass}">${aula.estado}</span>
          </div>
        </div>

        ${userVoteHtml}

        <!-- Calificación Física del Aula -->
        <div class="metrics-row" style="grid-template-columns: repeat(3, 1fr); margin: 0.5rem 0;">
          <div class="metric-item">
            <span class="metric-label">Mobiliario</span>
            <span class="metric-value">🪑 ${(aula.mobiliarioRating || 4.5).toFixed(1)}/5</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Equipos/Tomas</span>
            <span class="metric-value">🔌 ${(aula.equiposRating || 4.5).toFixed(1)}/5</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Ventilación</span>
            <span class="metric-value">💨 ${(aula.ventilacionRating || 4.5).toFixed(1)}/5</span>
          </div>
        </div>

        <ul class="aula-equipment-list">
          ${equipmentHtml}
        </ul>

        ${ecoHtml}

        <div style="margin-top: auto; padding-top: 0.85rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" style="flex: 1.1; font-weight: 700;" onclick="openCalificarAulaModal('${aula.id}')">
            ${rateBtnText}
          </button>
          <button class="btn btn-eco btn-sm" style="flex: 1;" onclick="openReporteAulaModal('${aula.id}')">
            📢 Reportar Falla
          </button>
        </div>

        ${adminEditBtnHtml}
      </div>
    `;
  }).join('');
}

const searchAulaInput = document.getElementById('search-aula');
if (searchAulaInput) searchAulaInput.addEventListener('input', () => { renderAulas(); trackDataConsumption(0.1); });

const filterPisoSelect = document.getElementById('filter-piso');
if (filterPisoSelect) filterPisoSelect.addEventListener('change', renderAulas);

const filterEstadoSelect = document.getElementById('filter-estado');
if (filterEstadoSelect) filterEstadoSelect.addEventListener('change', renderAulas);

// Modal Calificar Aula
let activeRateAulaId = null;

function openCalificarAulaModal(aulaId) {
  const aulas = getAulas();
  const aula = aulas.find(a => a.id === aulaId);
  if (!aula) return;

  activeRateAulaId = aulaId;
  const userAulaVotes = getUserAulaVotes();
  const userVoteKey = `${currentUser.token}_${aulaId}`;
  const existingVote = userAulaVotes[userVoteKey];

  const label = document.getElementById('eval-aula-title-name');
  const submitBtn = document.querySelector('#form-calificar-aula button[type="submit"]');

  if (existingVote) {
    if (label) label.textContent = `✏️ Modificar: ${aula.id} (${aula.ubicacion})`;
    if (submitBtn) submitBtn.textContent = '💾 Actualizar Calificación del Aula';

    setStarInputValues('stars-eval-aula-general', 'input-eval-aula-general', existingVote.generalRating);
    setStarInputValues('stars-eval-aula-mobiliario', 'input-eval-aula-mobiliario', existingVote.mobRating);
    setStarInputValues('stars-eval-aula-equipos', 'input-eval-aula-equipos', existingVote.eqRating);
    setStarInputValues('stars-eval-aula-ventilacion', 'input-eval-aula-ventilacion', existingVote.ventRating);
  } else {
    if (label) label.textContent = `${aula.id} (${aula.ubicacion})`;
    if (submitBtn) submitBtn.textContent = 'Registrar Calificación del Aula';

    const initGen = Math.round(aula.puntuacionGeneral || 5);
    const initMob = Math.round(aula.mobiliarioRating || 5);
    const initEq = Math.round(aula.equiposRating || 5);
    const initVent = Math.round(aula.ventilacionRating || 5);

    setStarInputValues('stars-eval-aula-general', 'input-eval-aula-general', initGen);
    setStarInputValues('stars-eval-aula-mobiliario', 'input-eval-aula-mobiliario', initMob);
    setStarInputValues('stars-eval-aula-equipos', 'input-eval-aula-equipos', initEq);
    setStarInputValues('stars-eval-aula-ventilacion', 'input-eval-aula-ventilacion', initVent);
  }

  const comInput = document.getElementById('eval-aula-comentario');
  if (comInput) comInput.value = '';
  const ecoCheck = document.getElementById('eval-aula-eco-check');
  if (ecoCheck) ecoCheck.checked = false;

  openModal('modal-calificar-aula');
}

// Procesar Calificación de Aula
const formCalificarAula = document.getElementById('form-calificar-aula');
if (formCalificarAula) {
  formCalificarAula.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeRateAulaId) return;

    const generalRating = parseFloat(document.getElementById('input-eval-aula-general').value) || 5;
    const mobRating = parseFloat(document.getElementById('input-eval-aula-mobiliario').value) || 5;
    const eqRating = parseFloat(document.getElementById('input-eval-aula-equipos').value) || 5;
    const ventRating = parseFloat(document.getElementById('input-eval-aula-ventilacion').value) || 5;
    const ecoImpact = document.getElementById('eval-aula-eco-check').checked;
    const comentario = document.getElementById('eval-aula-comentario').value.trim();

    const aulas = getAulas();
    const aulaIdx = aulas.findIndex(a => a.id === activeRateAulaId);
    if (aulaIdx === -1) return;

    const userAulaVotes = getUserAulaVotes();
    const userVoteKey = `${currentUser.token}_${activeRateAulaId}`;
    const existingVote = userAulaVotes[userVoteKey];

    // Actualización DIRECTA e inmediata para que cualquier modificación se refleje de inmediato
    aulas[aulaIdx].puntuacionGeneral = parseFloat(generalRating.toFixed(1));
    aulas[aulaIdx].mobiliarioRating = parseFloat(mobRating.toFixed(1));
    aulas[aulaIdx].equiposRating = parseFloat(eqRating.toFixed(1));
    aulas[aulaIdx].ventilacionRating = parseFloat(ventRating.toFixed(1));
    if (!existingVote) {
      aulas[aulaIdx].evaluacionesCount = (aulas[aulaIdx].evaluacionesCount || 0) + 1;
    }

    userAulaVotes[userVoteKey] = {
      generalRating, mobRating, eqRating, ventRating,
      fecha: new Date().toISOString().split('T')[0]
    };
    saveUserAulaVotes(userAulaVotes);

    if (ecoImpact) {
      aulas[aulaIdx].ecoReport = 'Se reportó consumo o desperdicio energético reciente en este salón.';
    }

    // Si incluyó comentario, pasa a aprobación
    if (comentario) {
      const queue = getModeracionQueue();
      queue.unshift({
        id: 'MOD-' + Date.now().toString().slice(-4),
        tipo: 'Aula',
        destinatario: aulas[aulaIdx].id,
        autorAnonimo: `Estudiante_#${currentUser.token.replace('EST-UMSA-', '')}`,
        puntuacion: generalRating,
        claridad: mobRating,
        cumplimiento: 0,
        contenido: comentario,
        motivo: 'Comentario de aula pendiente de revisión administrativa',
        estado: 'Pendiente',
        fecha: new Date().toISOString().split('T')[0]
      });
      saveModeracionQueue(queue);

      showNotification('💬 Tu comentario del aula fue enviado a la bandeja del Administrador para su aprobación.', 'info');
    }

    saveAulas(aulas);
    closeModal('modal-calificar-aula');
    renderAulas();
    renderAdminDashboard();

    const notifMsg = existingVote
      ? `✏️ ¡Calificación del aula ${aulas[aulaIdx].id} actualizada con éxito! General: ${generalRating}★`
      : `✅ ¡Calificación del aula ${aulas[aulaIdx].id} registrada con éxito! General: ${generalRating}★`;
    showNotification(notifMsg, 'success');
  });
}

// Modal Reporte de Desperfecto de Aula
let activeReportAulaId = null;

function openReporteAulaModal(aulaId) {
  activeReportAulaId = aulaId;
  const label = document.getElementById('report-aula-name');
  if (label) label.textContent = aulaId;
  const form = document.getElementById('form-reportar-aula');
  if (form) form.reset();
  openModal('modal-reporte-aula');
}

const formReporte = document.getElementById('form-reportar-aula');
if (formReporte) {
  formReporte.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeReportAulaId) return;

    const categoria = document.getElementById('rep-categoria').value;
    const severidad = document.getElementById('rep-severidad').value;
    const ecoImpact = document.getElementById('rep-eco-impact').checked;
    const descripcion = document.getElementById('rep-descripcion').value.trim();

    if (!descripcion) {
      alert('Por favor ingresa una descripción de la falla.');
      return;
    }

    const aulas = getAulas();
    const aulaIndex = aulas.findIndex(a => a.id === activeReportAulaId);
    if (aulaIndex === -1) return;

    const newReport = {
      id: 'REP-' + Date.now().toString().slice(-4),
      categoria: categoria,
      severidad: severidad,
      impactoEcologico: ecoImpact,
      descripcion: descripcion,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      reportadoPor: `Estudiante_#${currentUser.token.replace('EST-UMSA-', '')}`
    };

    if (!aulas[aulaIndex].reportes) aulas[aulaIndex].reportes = [];
    aulas[aulaIndex].reportes.unshift(newReport);

    if (severidad === 'Crítico') aulas[aulaIndex].estado = 'Crítico';
    else if (severidad === 'Moderado' && aulas[aulaIndex].estado !== 'Crítico') aulas[aulaIndex].estado = 'Moderado';

    if (ecoImpact) aulas[aulaIndex].ecoReport = `Alerta ecológica: ${descripcion.substring(0, 50)}...`;

    aulas[aulaIndex].activos.push({
      nombre: `${categoria}: ${descripcion.substring(0, 30)}...`,
      ok: false
    });

    saveAulas(aulas);
    renderAulas();
    renderAdminDashboard();
    closeModal('modal-reporte-aula');
    showNotification('📢 Falla técnica registrada y notificada al área de infraestructura.', 'success');
  });
}

// ============================================================================
// MÓDULO 3: MURO DE OPINIONES APROBADAS (SOLO MUESTRA APROBADOS)
// ============================================================================
function populateCommentDocenteSelect() {
  const select = document.getElementById('wall-docente-select');
  if (!select) return;
  const docentes = getDocentes();
  let optionsHtml = '<option value="">-- Selecciona un Docente / Asignatura --</option>';
  docentes.forEach(d => {
    optionsHtml += `<option value="${d.id}">${d.nombre} • [${d.asignatura}]</option>`;
  });
  select.innerHTML = optionsHtml;
}

function renderComentariosWall() {
  const container = document.getElementById('comentarios-feed-container');
  if (!container) return;

  const docentes = getDocentes();
  let allApprovedComments = [];

  docentes.forEach(d => {
    if (d.evaluaciones) {
      d.evaluaciones.forEach(ev => {
        if (ev.estado === 'Aprobado') {
          allApprovedComments.push({
            ...ev,
            docenteNombre: d.nombre,
            docenteId: d.id,
            docenteAula: d.aula,
            asignatura: d.asignatura
          });
        }
      });
    }
  });

  const filterDocSelect = document.getElementById('wall-docente-select');
  const filterDocId = filterDocSelect ? filterDocSelect.value : '';
  if (filterDocId) {
    allApprovedComments = allApprovedComments.filter(c => c.docenteId === filterDocId);
  }

  allApprovedComments.sort((a, b) => b.id.localeCompare(a.id));

  const countBadge = document.getElementById('wall-total-count');
  if (countBadge) countBadge.textContent = `${allApprovedComments.length} comentarios aprobados públicamente`;

  if (allApprovedComments.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: white; border-radius: 8px; border: 1px solid var(--border);">
        <p style="color: var(--text-muted);">Aún no hay comentarios aprobados para mostrar. Las opiniones pasan primero por revisión del administrador.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = allApprovedComments.map(c => `
    <div class="public-comment-card" style="background: white; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary);">
            👤 ${c.autor || 'Estudiante Anónimo'}
          </span>
          <div style="font-size: 0.82rem; color: var(--primary-light); font-weight: 600; margin-top: 0.2rem;">
            👨‍🏫 ${c.docenteNombre}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            📚 ${c.materia || c.asignatura} • 🏫 Aula: <strong>${c.docenteAula}</strong>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="background: #fef3c7; color: #92400e; font-weight: 700; font-size: 0.82rem; padding: 0.2rem 0.5rem; border-radius: 12px;">
            ⭐ ${c.puntuacion || 5}/5
          </span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">${c.fecha || '2026'}</span>
        </div>
      </div>

      <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; margin: 0.6rem 0; background: #f8fafc; padding: 0.75rem; border-radius: 6px; border-left: 3px solid var(--secondary);">
        "${c.comentario}"
      </p>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
        <span style="color: #10b981; font-weight: 600;">✔️ Aprobado y verificado por el Administrador</span>
        <button class="btn btn-secondary btn-sm" onclick="likeApprovedReview('${c.docenteId}', '${c.id}')">
          👍 Me sirvió (${c.likes || 1})
        </button>
      </div>
    </div>
  `).join('');
}

function likeApprovedReview(docId, revId) {
  const docentes = getDocentes();
  const doc = docentes.find(d => d.id === docId);
  if (!doc || !doc.evaluaciones) return;
  const rev = doc.evaluaciones.find(r => r.id === revId);
  if (rev) {
    rev.likes = (rev.likes || 0) + 1;
    saveDocentes(docentes);
    renderComentariosWall();
  }
}

// ============================================================================
// MÓDULO 4: PANEL DE ADMINISTRACIÓN Y APROBACIÓN EXCLUSIVA (TÚ TIENES EL CONTROL)
// ============================================================================
function renderAdminDashboard() {
  const docentes = getDocentes();
  const queue = getModeracionQueue();
  const incidencias = getIncidencias();
  const susList = getSusList();

  // KPIs
  const evaluadosCount = docentes.filter(d => d.evaluacionesCount > 0).length;
  const centralizacionPct = Math.round((evaluadosCount / docentes.length) * 100);

  const kpiCentVal = document.getElementById('kpi-centralizacion-val');
  if (kpiCentVal) kpiCentVal.textContent = `${centralizacionPct}%`;

  const avgSus = (susList.reduce((a, b) => a + b, 0) / susList.length).toFixed(1);
  const kpiSusVal = document.getElementById('kpi-sus-val');
  if (kpiSusVal) kpiSusVal.textContent = `${avgSus} pts`;

  const pendingComments = queue.filter(q => q.estado === 'Pendiente');
  const kpiModVal = document.getElementById('kpi-moderacion-val');
  if (kpiModVal) kpiModVal.textContent = `${pendingComments.length}`;

  const kpiDataVal = document.getElementById('kpi-consumo-val');
  if (kpiDataVal) kpiDataVal.textContent = `${(sessionDataConsumedKB / 1024).toFixed(2)} MB`;

  // Renderizar Bandeja de Aprobación de Comentarios Pendientes
  const modTableBody = document.getElementById('admin-moderacion-tbody');
  if (modTableBody) {
    if (pendingComments.length === 0) {
      modTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">🎉 No hay comentarios pendientes de aprobación. Todos han sido revisados.</td></tr>`;
    } else {
      modTableBody.innerHTML = pendingComments.map((item) => `
        <tr style="background-color: #fffbeb;">
          <td>
            <strong>${item.id}</strong><br>
            <span class="badge-tag" style="background:#e0e7ff; color:#3730a3;">${item.tipo}</span>
          </td>
          <td>
            <strong>${item.destinatario}</strong><br>
            <small style="color:var(--text-muted);">${item.autorAnonimo} • ${item.fecha}</small>
          </td>
          <td>
            <div style="font-size: 0.85rem; margin-bottom: 0.3rem;">⭐ Puntuación: <strong>${item.puntuacion}/5</strong></div>
            <em style="color:#1e293b; font-size: 0.9rem;">"${item.contenido}"</em>
            ${item.motivo.includes('Alerta') ? `<br><span style="color:#b91c1c; font-weight:700; font-size:0.75rem;">${item.motivo}</span>` : ''}
          </td>
          <td>
            <span class="badge-sev badge-sev-moderado">Pendiente de Aprobación</span>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <button class="btn btn-primary btn-sm" style="background-color: #10b981;" onclick="aprobarComentario('${item.id}')">
                ✔️ Aprobar y Publicar
              </button>
              <button class="btn btn-danger btn-sm" onclick="rechazarComentario('${item.id}')">
                ❌ Rechazar y Descartar
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  // Historial de Comentarios Aprobados (con opción de Despublicar)
  const approvedTableBody = document.getElementById('admin-aprobados-tbody');
  if (approvedTableBody) {
    let allApproved = [];
    docentes.forEach(d => {
      (d.evaluaciones || []).forEach(ev => {
        if (ev.estado === 'Aprobado') {
          allApproved.push({ ...ev, docId: d.id, docNombre: d.nombre });
        }
      });
    });

    if (allApproved.length === 0) {
      approvedTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1rem;">Sin comentarios aprobados actualmente.</td></tr>`;
    } else {
      approvedTableBody.innerHTML = allApproved.map(ap => `
        <tr>
          <td><strong>${ap.id}</strong></td>
          <td>${ap.docNombre}</td>
          <td>"${ap.comentario}"</td>
          <td><span class="test-status-badge test-pass">Publicado en la Web</span></td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="despublicarComentario('${ap.docId}', '${ap.id}')">
              🗑️ Despublicar
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Incidencias del Piloto
  const incTableBody = document.getElementById('admin-incidencias-tbody');
  if (incTableBody) {
    incTableBody.innerHTML = incidencias.map((inc) => `
      <tr>
        <td><strong>${inc.id}</strong></td>
        <td>${inc.incidencia}</td>
        <td>${inc.modulo}</td>
        <td><span class="badge-sev badge-sev-${inc.severidad.toLowerCase()}">${inc.severidad}</span></td>
        <td><span class="test-status-badge test-pass">${inc.estado}</span></td>
        <td><small>${inc.solucion}</small></td>
      </tr>
    `).join('');
  }
}

// Acción de Administrador: APROBAR Comentario
function aprobarComentario(modId) {
  const queue = getModeracionQueue();
  const itemIndex = queue.findIndex(q => q.id === modId);
  if (itemIndex === -1) return;

  const item = queue[itemIndex];
  item.estado = 'Aprobado';

  // Si es para docente, agregarlo a sus evaluaciones públicas aprobadas
  if (item.tipo === 'Docente') {
    const docentes = getDocentes();
    const docIdx = docentes.findIndex(d => d.id === item.docenteId || d.nombre === item.destinatario);
    if (docIdx !== -1) {
      if (!docentes[docIdx].evaluaciones) docentes[docIdx].evaluaciones = [];
      docentes[docIdx].evaluaciones.unshift({
        id: item.id,
        autor: item.autorAnonimo,
        puntuacion: item.puntuacion,
        claridad: item.claridad,
        cumplimiento: item.cumplimiento,
        materia: item.materia || docentes[docIdx].asignatura,
        comentario: item.contenido,
        fecha: item.fecha,
        likes: 1,
        estado: 'Aprobado'
      });
      saveDocentes(docentes);
    }
  }

  // Remover de la cola de pendientes
  queue.splice(itemIndex, 1);
  saveModeracionQueue(queue);

  renderDocentes();
  renderComentariosWall();
  renderAdminDashboard();
  updatePendingBadge();
  showNotification(`✔️ Comentario ${modId} APROBADO: ahora es visible públicamente en la plataforma.`, 'success');
}

// Acción de Administrador: RECHAZAR Comentario
function rechazarComentario(modId) {
  const queue = getModeracionQueue();
  const itemIndex = queue.findIndex(q => q.id === modId);
  if (itemIndex === -1) return;

  queue.splice(itemIndex, 1);
  saveModeracionQueue(queue);

  renderAdminDashboard();
  updatePendingBadge();
  showNotification(`❌ Comentario ${modId} RECHAZADO y descartado permanentemente.`, 'info');
}

// Acción de Administrador: Despublicar un comentario ya publicado
function despublicarComentario(docId, revId) {
  const docentes = getDocentes();
  const doc = docentes.find(d => d.id === docId);
  if (!doc || !doc.evaluaciones) return;

  doc.evaluaciones = doc.evaluaciones.filter(e => e.id !== revId);
  saveDocentes(docentes);

  renderDocentes();
  renderComentariosWall();
  renderAdminDashboard();
  showNotification('🗑️ Comentario despublicado y eliminado de la vista pública.', 'info');
}

// ============================================================================
// MÓDULO 5: ENCUESTA DE USABILIDAD SUS (FASE 7.3)
// ============================================================================
const susQuestions = [
  'Creo que me gustaría usar esta plataforma con frecuencia para planificar mis semestres.',
  'Encontré la plataforma innecesariamente compleja o difícil de entender.',
  'Pensé que la plataforma era fácil de usar y muy intuitiva.',
  'Creo que necesitaría el apoyo de una persona técnica para poder utilizar esta plataforma.',
  'Encontré que las distintas funciones de la plataforma estaban bien integradas.',
  'Pensé que había demasiada inconsistencia en esta herramienta.',
  'Imagino que la mayoría de los estudiantes aprenderían a usar esta plataforma muy rápidamente.',
  'Encontré la plataforma muy engorrosa o incómoda de utilizar.',
  'Me sentí muy seguro y confiado al calificar docentes y aulas bajo anonimato.',
  'Necesité aprender muchas cosas antes de poder empezar a usar la plataforma.'
];

function renderSusSurvey() {
  const container = document.getElementById('sus-questions-container');
  if (!container) return;

  container.innerHTML = susQuestions.map((q, idx) => `
    <div class="sus-question">
      <div style="font-weight: 600; font-size: 0.88rem; color: var(--primary);">
        ${idx + 1}. ${q}
      </div>
      <div class="sus-scale-options">
        <label class="sus-option-label">
          <span>1. Desacuerdo total</span>
          <input type="radio" name="sus_q_${idx}" value="1" ${idx % 2 === 0 ? '' : 'checked'} required>
        </label>
        <label class="sus-option-label">
          <span>2. En desacuerdo</span>
          <input type="radio" name="sus_q_${idx}" value="2">
        </label>
        <label class="sus-option-label">
          <span>3. Neutral</span>
          <input type="radio" name="sus_q_${idx}" value="3">
        </label>
        <label class="sus-option-label">
          <span>4. De acuerdo</span>
          <input type="radio" name="sus_q_${idx}" value="4">
        </label>
        <label class="sus-option-label">
          <span>5. Totalmente de acuerdo</span>
          <input type="radio" name="sus_q_${idx}" value="5" ${idx % 2 === 0 ? 'checked' : ''} required>
        </label>
      </div>
    </div>
  `).join('');
}

const formSus = document.getElementById('form-sus-survey');
if (formSus) {
  formSus.addEventListener('submit', (e) => {
    e.preventDefault();
    let oddSum = 0;
    let evenSum = 0;

    for (let i = 0; i < 10; i++) {
      const selected = document.querySelector(`input[name="sus_q_${i}"]:checked`);
      const val = selected ? parseInt(selected.value, 10) : 3;
      if (i % 2 === 0) oddSum += (val - 1);
      else evenSum += (5 - val);
    }

    const calculatedSUS = (oddSum + evenSum) * 2.5;
    const susList = getSusList();
    susList.push(calculatedSUS);
    saveSusList(susList);

    const resultBox = document.getElementById('sus-result-box');
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="callout ${calculatedSUS >= 80 ? 'callout-success' : 'callout-warning'}">
          <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Resultado del Test de Usabilidad SUS: <strong>${calculatedSUS} / 100</strong></h4>
          <p>
            ${calculatedSUS >= 80 
              ? '🎉 ¡NIVEL EXCELENTE ALCANZADO! (Supera la meta del proyecto > 80 pts).' 
              : '⚠️ Nivel aceptable con margen de mejora hacia la meta.'}
          </p>
        </div>
      `;
    }

    renderAdminDashboard();
    showNotification(`Encuesta SUS computada: ${calculatedSUS} pts`, 'success');
  });
}

// ============================================================================
// MODALES Y TOASTS
// ============================================================================
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
  }
});

function showNotification(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.padding = '0.85rem 1.35rem';
  toast.style.borderRadius = '8px';
  toast.style.color = 'white';
  toast.style.fontSize = '0.88rem';
  toast.style.fontWeight = '600';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.25)';
  toast.style.zIndex = '9999';
  toast.style.maxWidth = '380px';
  toast.style.lineHeight = '1.4';
  toast.style.transition = 'all 0.3s ease';

  if (type === 'success') toast.style.backgroundColor = '#059669';
  else if (type === 'danger') toast.style.backgroundColor = '#dc2626';
  else toast.style.backgroundColor = '#1e3a8a';

  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

// ============================================================================
// MÓDULO 6: BANCO DE EXÁMENES PASADOS (REPOSITORIO ESTUDIANTIL)
// ============================================================================
let activeViewingExam = null;

function renderExamenes() {
  const grid = document.getElementById('examenes-grid');
  const searchInput = document.getElementById('search-examen');
  const filterSem = document.getElementById('filter-examen-semestre');
  const filterTipo = document.getElementById('filter-examen-tipo');
  const filterDoc = document.getElementById('filter-examen-docente');

  if (!grid) return;

  const examenes = getExamenes();
  const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
  const semVal = (filterSem ? filterSem.value : '');
  const tipoVal = (filterTipo ? filterTipo.value : '');
  const docVal = (filterDoc ? filterDoc.value : '');

  // Poblado dinámico del filtro de docentes de exámenes
  if (filterDoc && filterDoc.options.length <= 1) {
    const docNames = [...new Set(examenes.map(e => e.docente))].sort();
    docNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      filterDoc.appendChild(opt);
    });
  }

  let filtered = examenes.filter(ex => {
    const matchQuery = ex.materia.toLowerCase().includes(query) ||
                       ex.docente.toLowerCase().includes(query) ||
                       ex.temas.toLowerCase().includes(query) ||
                       (ex.preguntas && ex.preguntas.some(p => p.toLowerCase().includes(query)));
    const matchSem = !semVal || ex.semestre.toLowerCase().includes(semVal.toLowerCase());
    const matchTipo = !tipoVal || ex.tipo === tipoVal;
    const matchDoc = !docVal || ex.docente === docVal;
    return matchQuery && matchSem && matchTipo && matchDoc;
  });

  const countBadge = document.getElementById('examenes-count-badge');
  if (countBadge) {
    countBadge.textContent = `Mostrando ${filtered.length} de ${examenes.length} exámenes pasados disponibles`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px solid var(--border);">
        <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">No se encontraron exámenes con los criterios de búsqueda.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetExamenFilters()">Restablecer Filtros</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(ex => {
    const previewPregunta = (ex.preguntas && ex.preguntas.length > 0)
      ? ex.preguntas[0]
      : 'Preguntas y ejercicios prácticos disponibles en el archivo adjunto.';

    const isPdf = (ex.archivoTipo && ex.archivoTipo.includes('pdf')) || (ex.archivoNombre && ex.archivoNombre.toLowerCase().endsWith('.pdf'));
    const fileBadgeHtml = ex.archivoDataUrl ? `
      <div class="exam-file-badge">
        <span>${isPdf ? '📄' : '🖼️'}</span>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px;" title="${ex.archivoNombre || 'Archivo adjunto'}">${ex.archivoNombre || (isPdf ? 'Documento_Examen.pdf' : 'Foto_Examen.png')}</span>
        <span style="color: #059669; font-weight: 700; margin-left: auto;">(Adjunto)</span>
      </div>
    ` : '';

    return `
      <div class="exam-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
          <span class="exam-badge-type">${ex.tipo}</span>
          <span style="font-size: 0.75rem; font-weight: 700; color: #4338ca; background: #e0e7ff; padding: 0.15rem 0.5rem; border-radius: 12px;">
            ${ex.semestre} • Gestión ${ex.gestion}
          </span>
        </div>

        <h3 class="exam-subject-title">${ex.materia}</h3>
        <div class="exam-docente-subtitle">
          <span>👨‍🏫 <strong>Docente:</strong> ${ex.docente}</span>
        </div>

        <div class="exam-meta-grid">
          <div class="exam-meta-item">
            <span>Modalidad:</span>
            <strong>${ex.modalidad || 'Presencial'}</strong>
          </div>
          <div class="exam-meta-item">
            <span>Aporte de:</span>
            <strong>${ex.subidoPor || 'Estudiante UMSA'}</strong>
          </div>
        </div>

        <div class="exam-topics-box">
          <strong style="color: var(--primary); display: block; margin-bottom: 0.2rem;">🎯 Temas Evaluados:</strong>
          <span>${ex.temas}</span>
        </div>

        ${fileBadgeHtml}

        <div style="font-size: 0.78rem; color: var(--text-muted); background: #f8fafc; padding: 0.6rem; border-radius: 4px; margin-bottom: 0.85rem; border-left: 2px solid var(--border);">
          <strong>Muestra:</strong> <em>"${previewPregunta.substring(0, 95)}..."</em>
        </div>

        <div class="exam-footer-actions">
          <button class="btn btn-primary btn-sm" style="flex: 1.1; font-weight: 700;" onclick="openVerExamenModal('${ex.id}')">
            👁️ Ver Examen Completo
          </button>
          <button class="btn btn-secondary btn-sm" style="flex: 1.1; font-weight: 600;" onclick="triggerSubirArchivoExamen('${ex.id}')" title="Subir o cambiar archivo PDF o Imagen para este examen">
            📎 Subir PDF o Imagen
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function initExamenesListeners() {
  const searchInput = document.getElementById('search-examen');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderExamenes();
      trackDataConsumption(0.1);
    });
  }

  const filterSem = document.getElementById('filter-examen-semestre');
  if (filterSem) filterSem.addEventListener('change', renderExamenes);

  const filterTipo = document.getElementById('filter-examen-tipo');
  if (filterTipo) filterTipo.addEventListener('change', renderExamenes);

  const filterDoc = document.getElementById('filter-examen-docente');
  if (filterDoc) filterDoc.addEventListener('change', renderExamenes);

  // Escuchar archivo directo desde tarjetas
  const directInput = document.getElementById('exam-direct-file-input');
  if (directInput) {
    directInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0 && activeExamForUpload) {
        procesarArchivoExamen(activeExamForUpload, e.target.files[0]);
      }
    });
  }

  // Subir Examen Form (Soporta PDF o Foto/Imagen y textos)
  const formSubir = document.getElementById('form-subir-examen');
  if (formSubir) {
    formSubir.addEventListener('submit', (e) => {
      e.preventDefault();

      const semestre = document.getElementById('subir-exam-semestre').value;
      const gestion = document.getElementById('subir-exam-gestion').value;
      const materia = document.getElementById('subir-exam-materia').value.trim().toUpperCase();
      const docente = document.getElementById('subir-exam-docente').value.trim().toUpperCase();
      const tipo = document.getElementById('subir-exam-tipo').value;
      const modalidad = document.getElementById('subir-exam-modalidad').value;
      const temas = document.getElementById('subir-exam-temas').value.trim();
      const preguntasRaw = document.getElementById('subir-exam-preguntas').value.trim();
      const fileInput = document.getElementById('subir-exam-file');
      const file = (fileInput && fileInput.files && fileInput.files.length > 0) ? fileInput.files[0] : null;

      if (!materia || !docente || !temas) {
        showNotification('Por favor complete materia, docente titular y temas evaluados.', 'danger');
        return;
      }

      if (!preguntasRaw && !file) {
        showNotification('Por favor escribe las preguntas del examen o adjunta el archivo PDF / Imagen.', 'danger');
        return;
      }

      let preguntas = [];
      if (preguntasRaw) {
        const lineas = preguntasRaw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        preguntas = lineas.length > 0 ? lineas : [preguntasRaw];
      } else {
        preguntas = ['Examen oficial completo disponible en el archivo adjunto (PDF / Imagen). Revisa el visor interactivo para consultar las preguntas y ejercicios prácticos.'];
      }

      const examId = 'EXAM-' + Date.now().toString().slice(-4);
      const newExam = {
        id: examId,
        materia,
        docente,
        semestre,
        gestion,
        tipo,
        modalidad,
        temas,
        preguntas,
        fechaSubida: new Date().toISOString().split('T')[0],
        subidoPor: `Estudiante_#${currentUser.token.replace('EST-UMSA-', '')}`,
        descargas: 1,
        archivoDataUrl: null,
        archivoNombre: null,
        archivoTipo: null,
        archivoSize: 0
      };

      if (file) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const reader = new FileReader();
        reader.onload = function(ev) {
          newExam.archivoDataUrl = ev.target.result;
          newExam.archivoNombre = file.name;
          newExam.archivoTipo = isPdf ? 'application/pdf' : (file.type || 'image/jpeg');
          newExam.archivoSize = file.size;

          const examenes = getExamenes();
          examenes.unshift(newExam);
          saveExamenes(examenes);

          closeModal('modal-subir-examen');
          formSubir.reset();
          renderExamenes();
          showNotification(`🎉 ¡Examen de ${materia} (${tipo}) con archivo adjunto subido exitosamente!`, 'success');
        };
        reader.readAsDataURL(file);
      } else {
        const examenes = getExamenes();
        examenes.unshift(newExam);
        saveExamenes(examenes);

        closeModal('modal-subir-examen');
        formSubir.reset();
        renderExamenes();
        showNotification(`🎉 ¡Examen de ${materia} (${tipo}) subido exitosamente al banco estudiantil!`, 'success');
      }
    });
  }
}

// Control y Procesamiento de Archivos PDF e Imágenes para Exámenes
let activeExamForUpload = null;

function triggerSubirArchivoExamen(examId) {
  activeExamForUpload = examId;
  const input = document.getElementById('exam-direct-file-input');
  if (input) {
    input.value = '';
    input.click();
  }
}

function procesarArchivoExamen(examId, file) {
  if (!file) return;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImg = file.type.startsWith('image/');

  if (!isPdf && !isImg) {
    showNotification('⚠️ Formato no compatible. Por favor sube un archivo PDF o una imagen (JPG, PNG, WEBP).', 'danger');
    return;
  }

  if (isPdf && file.size > 4.5 * 1024 * 1024) {
    showNotification('⚠️ El PDF seleccionado es muy pesado (>4.5MB). Por favor utiliza un PDF optimizado.', 'danger');
    return;
  }

  if (isImg) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const rawDataUrl = e.target.result;
      if (file.size <= 750 * 1024) {
        guardarArchivoEnExamen(examId, rawDataUrl, file.name, file.type || 'image/jpeg', file.size);
      } else {
        const img = new Image();
        img.onload = function() {
          const maxDim = 1500;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          guardarArchivoEnExamen(examId, compressed, file.name.replace(/\.[^/.]+$/, "") + ".jpg", 'image/jpeg', Math.round(compressed.length * 0.75));
        };
        img.src = rawDataUrl;
      }
    };
    reader.onerror = function() {
      showNotification('❌ Error al leer la imagen seleccionada.', 'danger');
    };
    reader.readAsDataURL(file);
  } else {
    // PDF
    const reader = new FileReader();
    reader.onload = function(e) {
      guardarArchivoEnExamen(examId, e.target.result, file.name, 'application/pdf', file.size);
    };
    reader.onerror = function() {
      showNotification('❌ Error al leer el archivo PDF seleccionado.', 'danger');
    };
    reader.readAsDataURL(file);
  }
}

function guardarArchivoEnExamen(examId, dataUrl, nombre, tipo, size) {
  try {
    const examenes = getExamenes();
    const ex = examenes.find(e => e.id === examId);
    if (!ex) return;

    ex.archivoDataUrl = dataUrl;
    ex.archivoNombre = nombre;
    ex.archivoTipo = tipo;
    ex.archivoSize = size;
    ex.fechaSubida = new Date().toISOString().split('T')[0];

    saveExamenes(examenes);
    renderExamenes();

    if (activeViewingExam && activeViewingExam.id === examId) {
      openVerExamenModal(examId);
    }

    const tipoDoc = (tipo && tipo.includes('pdf')) ? 'Documento PDF' : 'Imagen';
    showNotification(`✅ ¡${tipoDoc} "${nombre}" guardado y vinculado con éxito al examen!`, 'success');
  } catch (err) {
    console.error(err);
    showNotification('⚠️ No se pudo guardar el archivo por límite de memoria local. Intenta con un archivo más ligero.', 'danger');
  }
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function abrirPdfEnPestana(examId) {
  const examenes = getExamenes();
  const exam = examenes.find(e => e.id === examId);
  if (!exam || !exam.archivoDataUrl) return;
  try {
    const blob = dataUrlToBlob(exam.archivoDataUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (e) {
    window.open(exam.archivoDataUrl, '_blank');
  }
}

function abrirArchivoEnPestana(examId) {
  const examenes = getExamenes();
  const exam = examenes.find(e => e.id === examId);
  if (!exam || !exam.archivoDataUrl) return;
  try {
    const blob = dataUrlToBlob(exam.archivoDataUrl);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (e) {
    window.open(exam.archivoDataUrl, '_blank');
  }
}

function resetExamenFilters() {
  const searchInput = document.getElementById('search-examen');
  const filterSem = document.getElementById('filter-examen-semestre');
  const filterTipo = document.getElementById('filter-examen-tipo');
  const filterDoc = document.getElementById('filter-examen-docente');

  if (searchInput) searchInput.value = '';
  if (filterSem) filterSem.value = '';
  if (filterTipo) filterTipo.value = '';
  if (filterDoc) filterDoc.value = '';
  renderExamenes();
}

function openSubirExamenModal() {
  populateSubirMateriaDocenteSelects();
  const form = document.getElementById('form-subir-examen');
  if (form) form.reset();
  openModal('modal-subir-examen');
}

function populateSubirMateriaDocenteSelects() {
  const listMat = document.getElementById('list-materias-suggest');
  const listDoc = document.getElementById('list-docentes-suggest');
  if (!listMat || !listDoc) return;

  const docentes = getDocentes();
  const semSelected = document.getElementById('subir-exam-semestre')?.value || '';

  const matSet = new Set();
  const docSet = new Set();

  docentes.forEach(d => {
    if (!semSelected || d.semestre.toLowerCase().includes(semSelected.toLowerCase().substring(0, 3))) {
      d.asignatura.split('/').forEach(m => matSet.add(m.trim()));
      docSet.add(d.nombre);
    }
  });

  listMat.innerHTML = [...matSet].map(m => `<option value="${m}">`).join('');
  listDoc.innerHTML = [...docSet].map(d => `<option value="${d}">`).join('');
}

function openVerExamenModal(examId) {
  const examenes = getExamenes();
  const exam = examenes.find(e => e.id === examId);
  if (!exam) return;

  activeViewingExam = exam;
  const modalBody = document.getElementById('ver-exam-modal-body');
  const modalTitle = document.getElementById('ver-exam-modal-title');
  if (modalTitle) modalTitle.textContent = `📄 ${exam.tipo}: ${exam.materia}`;

  const isPdf = (exam.archivoTipo && exam.archivoTipo.includes('pdf')) || (exam.archivoDataUrl && exam.archivoDataUrl.startsWith('data:application/pdf')) || (exam.archivoNombre && exam.archivoNombre.toLowerCase().endsWith('.pdf'));
  const isImg = (exam.archivoTipo && exam.archivoTipo.startsWith('image/')) || (exam.archivoDataUrl && exam.archivoDataUrl.startsWith('data:image/'));

  let fileViewerHtml = '';
  if (exam.archivoDataUrl) {
    if (isPdf) {
      fileViewerHtml = `
        <div class="exam-file-viewer-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span style="font-weight: 700; color: #0f2d59; font-size: 0.92rem;">📄 Documento PDF Adjunto:</span>
              <span style="font-size: 0.8rem; color: #475569; display: block;">${exam.archivoNombre || 'Examen_Oficial.pdf'}</span>
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-primary" onclick="abrirPdfEnPestana('${exam.id}')" style="font-size: 0.76rem; font-weight: 700;">
                ↗️ Abrir en Pantalla Completa
              </button>
              <a href="${exam.archivoDataUrl}" download="${exam.archivoNombre || 'Examen_Oficial.pdf'}" class="btn btn-sm btn-secondary" style="font-size: 0.76rem; text-decoration: none;">
                💾 Guardar PDF
              </a>
              <button type="button" class="btn btn-sm btn-secondary" onclick="triggerSubirArchivoExamen('${exam.id}')" style="font-size: 0.76rem;">
                🔄 Cambiar PDF
              </button>
            </div>
          </div>
          <div class="exam-pdf-preview-box">
            <iframe src="${exam.archivoDataUrl}#toolbar=1" type="application/pdf">
              <p style="padding: 1.5rem; text-align: center;">Tu navegador no soporta visualizador integrado. <a href="${exam.archivoDataUrl}" download="${exam.archivoNombre || 'examen.pdf'}">Descarga el PDF aquí</a>.</p>
            </iframe>
          </div>
        </div>
      `;
    } else {
      fileViewerHtml = `
        <div class="exam-file-viewer-container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span style="font-weight: 700; color: #0f2d59; font-size: 0.92rem;">🖼️ Foto / Imagen del Examen:</span>
              <span style="font-size: 0.8rem; color: #475569; display: block;">${exam.archivoNombre || 'Foto_Examen.png'}</span>
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-sm btn-primary" onclick="abrirArchivoEnPestana('${exam.id}')" style="font-size: 0.76rem; font-weight: 700;">
                🔍 Ver Imagen Completa
              </button>
              <a href="${exam.archivoDataUrl}" download="${exam.archivoNombre || 'Foto_Examen.png'}" class="btn btn-sm btn-secondary" style="font-size: 0.76rem; text-decoration: none;">
                💾 Guardar Imagen
              </a>
              <button type="button" class="btn btn-sm btn-secondary" onclick="triggerSubirArchivoExamen('${exam.id}')" style="font-size: 0.76rem;">
                🔄 Cambiar Imagen
              </button>
            </div>
          </div>
          <div class="exam-img-preview-box">
            <img src="${exam.archivoDataUrl}" alt="${exam.materia}">
          </div>
        </div>
      `;
    }
  } else {
    fileViewerHtml = `
      <div style="background: #f0fdf4; border: 1px dashed #22c55e; border-radius: 8px; padding: 0.85rem 1.15rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <strong style="color: #15803d; font-size: 0.88rem;">📎 ¿Tienes el examen en PDF o foto?</strong>
          <p style="font-size: 0.78rem; color: #334155; margin: 0.15rem 0 0 0;">Sube el PDF o imagen legible para que se muestre en el visor interactivo.</p>
        </div>
        <button type="button" class="btn btn-sm btn-eco" onclick="triggerSubirArchivoExamen('${exam.id}')" style="font-weight: 700;">
          📤 Subir PDF o Imagen
        </button>
      </div>
    `;
  }

  if (modalBody) {
    const preguntasHtml = (exam.preguntas || []).map((p, idx) => `
      <div class="exam-sheet-question">
        <h5>${p.startsWith((idx + 1) + '.') ? p : `${idx + 1}. ${p}`}</h5>
      </div>
    `).join('');

    modalBody.innerHTML = `
      ${fileViewerHtml}

      <div class="exam-sheet-paper">
        <div class="exam-sheet-header">
          <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: bold;">
            UNIVERSIDAD MAYOR DE SAN ANDRÉS<br>
            FACULTAD DE CIENCIAS ECONÓMICAS Y FINANCIERAS<br>
            CARRERA DE ADMINISTRACIÓN DE EMPRESAS
          </div>
          <h3 style="margin-top: 0.6rem;">${exam.tipo.toUpperCase()} • GESTIÓN ${exam.gestion}</h3>
        </div>

        <div style="border: 1px solid #cbd5e1; padding: 0.6rem 0.85rem; font-size: 0.85rem; margin-bottom: 1.25rem; background: #fdfdfd; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
          <div><strong>Asignatura:</strong> ${exam.materia}</div>
          <div><strong>Semestre:</strong> ${exam.semestre}</div>
          <div><strong>Docente Titular:</strong> ${exam.docente}</div>
          <div><strong>Modalidad:</strong> ${exam.modalidad || 'Presencial'}</div>
        </div>

        <div style="background: #f8fafc; border-left: 3px solid #0f2d59; padding: 0.5rem 0.75rem; font-size: 0.82rem; margin-bottom: 1.25rem;">
          <strong>Unidades Temáticas Evaluadas:</strong> ${exam.temas}
        </div>

        <div style="margin-top: 1rem;">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.35rem; margin-bottom: 1rem; color: #0f2d59;">
            CUESTIONARIO Y EJERCICIOS PRÁCTICOS
          </h4>
          ${preguntasHtml}
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1; font-size: 0.75rem; color: #64748b; display: flex; justify-content: space-between;">
          <span>Banco Estudiantil Ranking CAE • UMSA</span>
          <span>Aportado por: ${exam.subidoPor || 'Estudiante'} • ${exam.fechaSubida}</span>
        </div>
      </div>
    `;
  }

  const btnDescargar = document.getElementById('btn-descargar-examen-pdf');
  if (btnDescargar) {
    if (exam.archivoDataUrl) {
      btnDescargar.textContent = isPdf ? '📥 Descargar Documento (PDF)' : '📥 Descargar Archivo (Imagen)';
    } else {
      btnDescargar.textContent = '📥 Descargar Transcripción (.txt)';
    }
  }

  openModal('modal-ver-examen');
  trackDataConsumption(0.5);
}

function descargarExamenDirecto(examId) {
  const examenes = getExamenes();
  const exam = examenes.find(e => e.id === examId);
  if (!exam) return;

  exam.descargas = (exam.descargas || 0) + 1;
  saveExamenes(examenes);
  renderExamenes();

  activeViewingExam = exam;
  descargarExamenActual();
}

function descargarExamenActual() {
  if (!activeViewingExam) return;

  if (activeViewingExam.archivoDataUrl) {
    const a = document.createElement('a');
    a.href = activeViewingExam.archivoDataUrl;
    const isPdf = (activeViewingExam.archivoTipo && activeViewingExam.archivoTipo.includes('pdf')) || (activeViewingExam.archivoNombre && activeViewingExam.archivoNombre.toLowerCase().endsWith('.pdf'));
    const defaultName = isPdf ? 'Examen_Oficial.pdf' : 'Examen_Oficial.png';
    a.download = activeViewingExam.archivoNombre || defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification(`📥 Archivo "${a.download}" descargado correctamente.`, 'success');
    return;
  }

  const content = `========================================================================
UNIVERSIDAD MAYOR DE SAN ANDRÉS
FACULTAD DE CIENCIAS ECONÓMICAS Y FINANCIERAS
CARRERA DE ADMINISTRACIÓN DE EMPRESAS
REPOSITORIO ESTUDIANTIL "RANKING CAE"
========================================================================

EVALUACIÓN: ${activeViewingExam.tipo}
GESTIÓN: ${activeViewingExam.gestion}
SEMESTRE: ${activeViewingExam.semestre}
ASIGNATURA: ${activeViewingExam.materia}
DOCENTE TITULAR: ${activeViewingExam.docente}
MODALIDAD: ${activeViewingExam.modalidad || 'Presencial'}

TEMAS EVALUADOS:
${activeViewingExam.temas}

------------------------------------------------------------------------
ENUNCIADOS Y PREGUNTAS DEL EXAMEN:
------------------------------------------------------------------------
${activeViewingExam.preguntas.map((p, idx) => p.startsWith((idx + 1) + '.') ? p : `${idx + 1}. ${p}`).join('\n\n')}

========================================================================
Descargado de la Plataforma Ranking CAE UMSA
Fecha: ${new Date().toLocaleDateString('es-BO')}
========================================================================
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `UMSA_Examen_${activeViewingExam.materia.substring(0, 10).replace(/[^a-zA-Z0-9]/g, '_')}_${activeViewingExam.gestion.replace('/', '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`📥 Examen de ${activeViewingExam.materia} descargado correctamente.`, 'success');
}

function imprimirExamenActual() {
  if (!activeViewingExam) return;
  window.print();
}

// ============================================================================
// MÓDULO 7: MODIFICACIÓN DIRECTA DE PARÁMETROS Y CALIFICACIONES (ADMIN)
// ============================================================================
function initAdminModals() {
  // Submit Docente Edit
  const formDoc = document.getElementById('form-admin-edit-docente');
  if (formDoc) {
    formDoc.addEventListener('submit', (e) => {
      e.preventDefault();
      const docId = document.getElementById('admin-edit-doc-id').value;
      const docentes = getDocentes();
      const docIdx = docentes.findIndex(d => d.id === docId);
      if (docIdx === -1) return;

      docentes[docIdx].nombre = document.getElementById('admin-edit-doc-nombre').value.trim().toUpperCase();
      docentes[docIdx].asignatura = document.getElementById('admin-edit-doc-materia').value.trim().toUpperCase();
      docentes[docIdx].aula = document.getElementById('admin-edit-doc-aula').value.trim();
      docentes[docIdx].semestre = document.getElementById('admin-edit-doc-semestre').value.trim();
      docentes[docIdx].indiceClaridad = parseFloat(document.getElementById('admin-edit-doc-claridad').value) || 4.5;
      docentes[docIdx].puntuacionGeneral = parseFloat(document.getElementById('admin-edit-doc-general').value) || 4.5;
      docentes[docIdx].cumplimientoPrograma = parseInt(document.getElementById('admin-edit-doc-syllabus').value, 10) || 95;
      docentes[docIdx].descripcion = document.getElementById('admin-edit-doc-desc').value.trim();

      saveDocentes(docentes);
      closeModal('modal-admin-edit-docente');
      renderDocentes();
      renderAdminDashboard();
      showNotification(`👑 Datos y calificaciones de ${docentes[docIdx].nombre} actualizados con éxito por el Administrador.`, 'success');
    });
  }

  // Submit Aula Edit
  const formAula = document.getElementById('form-admin-edit-aula');
  if (formAula) {
    formAula.addEventListener('submit', (e) => {
      e.preventDefault();
      const aulaId = document.getElementById('admin-edit-aula-id').value;
      const aulas = getAulas();
      const aulaIdx = aulas.findIndex(a => a.id === aulaId);
      if (aulaIdx === -1) return;

      aulas[aulaIdx].ubicacion = document.getElementById('admin-edit-aula-ubicacion').value.trim();
      aulas[aulaIdx].estado = document.getElementById('admin-edit-aula-estado').value;
      aulas[aulaIdx].mobiliarioRating = parseFloat(document.getElementById('admin-edit-aula-mob').value) || 4.5;
      aulas[aulaIdx].equiposRating = parseFloat(document.getElementById('admin-edit-aula-eq').value) || 4.5;
      aulas[aulaIdx].ventilacionRating = parseFloat(document.getElementById('admin-edit-aula-vent').value) || 4.5;
      const eco = document.getElementById('admin-edit-aula-eco').value.trim();
      aulas[aulaIdx].ecoReport = eco ? eco : null;

      saveAulas(aulas);
      closeModal('modal-admin-edit-aula');
      renderAulas();
      renderAdminDashboard();
      showNotification(`👑 Parámetros y estado de ${aulas[aulaIdx].id} actualizados con éxito por el Administrador.`, 'success');
    });
  }
}

function openAdminEditDocenteModal(docId) {
  const docentes = getDocentes();
  const doc = docentes.find(d => d.id === docId);
  if (!doc) return;

  document.getElementById('admin-edit-doc-id').value = doc.id;
  document.getElementById('admin-edit-doc-nombre').value = doc.nombre;
  document.getElementById('admin-edit-doc-materia').value = doc.asignatura;
  document.getElementById('admin-edit-doc-aula').value = doc.aula;
  document.getElementById('admin-edit-doc-semestre').value = doc.semestre;
  document.getElementById('admin-edit-doc-claridad').value = doc.indiceClaridad;
  document.getElementById('admin-edit-doc-general').value = doc.puntuacionGeneral;

  const slider = document.getElementById('admin-edit-doc-syllabus');
  const valBadge = document.getElementById('admin-edit-doc-syllabus-val');
  if (slider) slider.value = doc.cumplimientoPrograma;
  if (valBadge) valBadge.textContent = `${doc.cumplimientoPrograma}%`;

  document.getElementById('admin-edit-doc-desc').value = doc.descripcion;

  openModal('modal-admin-edit-docente');
}

function openAdminEditAulaModal(aulaId) {
  const aulas = getAulas();
  const aula = aulas.find(a => a.id === aulaId);
  if (!aula) return;

  document.getElementById('admin-edit-aula-id').value = aula.id;
  document.getElementById('admin-edit-aula-nombre').value = aula.id;
  document.getElementById('admin-edit-aula-ubicacion').value = aula.ubicacion;
  document.getElementById('admin-edit-aula-estado').value = aula.estado;
  document.getElementById('admin-edit-aula-mob').value = (aula.mobiliarioRating || 4.5).toFixed(1);
  document.getElementById('admin-edit-aula-eq').value = (aula.equiposRating || 4.5).toFixed(1);
  document.getElementById('admin-edit-aula-vent').value = (aula.ventilacionRating || 4.5).toFixed(1);
  document.getElementById('admin-edit-aula-eco').value = aula.ecoReport || '';

  openModal('modal-admin-edit-aula');
}
