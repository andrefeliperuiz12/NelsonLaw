// ============================================================
// Contenido de las páginas de servicio — ESPAÑOL
// ============================================================
// Lo lee scripts/build-pages.mjs. Tras editar, ejecutar:
//   node scripts/build-pages.mjs
//
// REGLAS EDITORIALES (ver informe de la reestructuración):
//   - Sin requisitos, montos ni plazos legales concretos mientras no se
//     verifiquen en fuente oficial vigente y se registre la fecha.
//   - Sin promesas de resultado, de plazo, de disponibilidad 24/7 ni de
//     trámites totalmente virtuales.
//   - Distinguir siempre la presencia exigida al cliente de la del abogado.
//   - Cada página debe tener su equivalente con el mismo alcance en
//     content.en.mjs.
// El texto admite <em>, <strong> y <a>: es contenido propio, no del usuario.
// ============================================================

import { SITE } from './site.mjs';

const s = (key) => SITE.slugs[key].es;

const ui = {
  home: 'Inicio',
  ogLocale: 'es_PA',
  navLabel: 'Navegación principal',
  breadcrumbLabel: 'Ruta de navegación',
  nav: [
    { hash: '#servicios', label: 'Servicios' },
    { hash: '#como-trabajamos', label: 'Cómo trabajamos' },
    { hash: '#contacto', label: 'Contacto' },
  ],
  navCta: 'Solicitar evaluación',
  faqTag: 'Preguntas frecuentes',
  faqTitle: 'Lo que conviene <em>saber antes</em>',
  ctaNote:
    'Enviar una consulta no formaliza la contratación ni confirma que aceptemos el asunto.',
  siblingsTitle: 'Otros servicios',
  disclaimer:
    'El contenido de esta página tiene carácter informativo general sobre el ordenamiento panameño y no constituye asesoría legal ni sustituye el análisis de un caso concreto. Enviar una consulta no crea por sí solo una relación abogado-cliente: el encargo se formaliza únicamente mediante acuerdo escrito, después de evaluar el asunto y verificar que no exista conflicto de interés.',
  footerTagline: 'Law Firm · Ciudad de Panamá',
  rights: 'Todos los derechos reservados.',
  footerLinks: [
    { href: '/' + s('residencia'), label: 'Residencia' },
    { href: '/' + s('permisos'), label: 'Permisos de trabajo' },
    { href: '/' + s('relocalizacion'), label: 'Relocalización' },
    { href: '/' + s('contratos'), label: 'Contratos e inmuebles' },
    { href: '/' + s('administrativo'), label: 'Administrativo' },
    { href: '/' + s('tributario'), label: 'Tributario' },
    { href: '/' + s('constitucional'), label: 'Constitucional' },
    { href: '/#contacto', label: 'Contacto' },
    { href: '/privacidad', label: 'Privacidad' },
  ],
};

// Forma de trabajo común. Una página puede sustituirla con process.steps.
const defaultSteps = [
  {
    title: 'Evaluación inicial',
    text: 'Revisamos su consulta, comprobamos que no exista conflicto de interés y le indicamos si podemos asumir el asunto, qué plazos hay y qué hace falta.',
  },
  {
    title: 'Propuesta por escrito',
    text: 'Alcance, honorarios y gastos de terceros por separado, y lo que no está incluido. Nada empieza sin su aceptación.',
  },
  {
    title: 'Preparación a distancia',
    text: 'Documentos, escritos y estrategia se trabajan por correo, videoconferencia o mensajería, con su revisión antes de presentar.',
  },
  {
    title: 'Presentación y seguimiento',
    text: 'Presentación ante la entidad que corresponda, atención de requerimientos y reporte del avance hasta la resolución.',
  },
];

const pages = {
  // ----------------------------------------------------------------------
  residencia: {
    slug: s('residencia'),
    area: 'residencia_migracion',
    num: '01',
    cardName: 'Residencia y migración',
    cardDesc:
      'Evaluación de su perfil, expediente de residencia, dependientes, renovaciones y subsanaciones.',
    title: 'Residencia en Panamá para extranjeros | Juriscorp S.C.',
    description:
      'Evaluación de su perfil migratorio y preparación del expediente de residencia en Panamá: dependientes, renovaciones, subsanaciones y documentación extranjera.',
    schemaName: 'Residencia y migración en Panamá',
    breadcrumb: 'Residencia y migración',
    eyebrow: 'Servicio',
    h1: 'Residencia <em>y migración</em>',
    lead:
      'Elegir una categoría de residencia que no encaja con su perfil, o presentar un documento extranjero sin la apostilla o la traducción correcta, suele costar meses. Antes de reunir papeles conviene saber qué vía le corresponde y qué le van a exigir. Le ayudamos a ordenar ese camino y llevamos el expediente hasta su resolución.',
    audience: {
      label: 'A quién se dirige',
      value: 'Extranjeros que desean residir en Panamá, y sus dependientes',
      note: 'También a quienes ya tienen un trámite en curso y necesitan renovar, prorrogar o atender una observación de la autoridad.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'Del primer análisis <em>a la resolución</em>',
      intro:
        'Primero evaluamos; después recomendamos una vía. No trabajamos con catálogos de visas: la categoría adecuada depende de su situación concreta.',
      items: [
        {
          title: 'Evaluación de perfil y categoría',
          text: 'Analizamos su actividad, sus medios económicos y sus vínculos familiares o laborales, y le indicamos qué categorías de residencia podrían aplicarle y cuál recomendamos, con sus exigencias.',
        },
        {
          title: 'Solicitud y expediente',
          text: 'Lista de documentos adaptada a su caso, revisión de vigencias y formatos, redacción de la solicitud y armado del expediente para presentarlo ante el Servicio Nacional de Migración.',
        },
        {
          title: 'Residencia de dependientes',
          text: 'Inclusión de cónyuge, hijos u otros dependientes cuando la categoría lo permite, con la documentación de parentesco que corresponda.',
        },
        {
          title: 'Renovaciones y prórrogas',
          text: 'Control de vencimientos y preparación de las renovaciones o prórrogas que correspondan a su categoría, para que su estatus no quede vencido.',
        },
        {
          title: 'Subsanaciones y seguimiento',
          text: 'Atención de requerimientos y observaciones de la autoridad, y seguimiento del expediente hasta que se resuelva.',
        },
        {
          title: 'Documentación extranjera',
          text: 'Coordinación de apostillas, legalizaciones y traducciones oficiales de documentos emitidos fuera de Panamá. Los costos de terceros se informan aparte.',
        },
      ],
      excluded: {
        title: 'Fuera de este servicio',
        text: 'La naturalización y cualquier trámite ante el Tribunal Electoral, el Registro Civil o la Dirección de Cedulación. Tampoco garantizamos la aprobación ni el plazo: la decisión corresponde a la autoridad migratoria.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Cómo llevamos <em>su expediente</em>',
      presence: {
        title: 'Su presencia y la del abogado no son lo mismo',
        text: 'Buena parte del trabajo se hace sin que usted esté en Panamá. Pero hay trámites migratorios que pueden exigir que el solicitante comparezca en persona, por ejemplo para registros o para recibir documentos. Le indicamos cuáles aplican a su caso antes de que planifique el viaje. No ofrecemos “residencia sin viajar”.',
      },
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo. No necesitamos originales ni copias para empezar; basta con que sepa estos datos:',
      items: [
        'Su nacionalidad y el país donde vive ahora.',
        'El motivo principal de la residencia: trabajo, inversión, jubilación, familia u otro.',
        'Qué dependientes le acompañarían.',
        'Si ya está en Panamá, su estatus migratorio actual y sus fechas de vencimiento.',
        'Fecha aproximada en la que piensa establecerse.',
        'Qué documentos tiene ya apostillados o traducidos.',
      ],
      note: {
        title: 'No envíe documentos por el formulario',
        text: 'La lista definitiva depende de la categoría y se la entregamos por escrito tras la evaluación. No adjunte ni escriba números de pasaporte u otros datos de identidad en la consulta web.',
      },
    },
    faq: [
      {
        q: '¿Puedo obtener la residencia sin viajar a Panamá?',
        a: [
          'Por lo general, no. Una parte importante del trabajo puede hacerse a distancia, pero hay trámites que pueden exigir su comparecencia personal.',
          'Le indicamos cuáles corresponden a su categoría y cómo concentrar las visitas, sin prometerle que no tendrá que venir.',
        ],
      },
      {
        q: '¿La residencia me autoriza a trabajar?',
        a: [
          'No necesariamente. Residir y trabajar son autorizaciones distintas, y el régimen depende de la categoría. Algunas personas necesitarán además un permiso de trabajo.',
          `Lo revisamos en la evaluación. Más información en <a href="/${s('permisos')}">Permisos de trabajo</a>.`,
        ],
      },
      {
        q: '¿Cuánto tarda el trámite?',
        a: [
          'Depende de la categoría, de la carga de trabajo de la autoridad y de que el expediente esté completo desde el principio. No ofrecemos plazos garantizados; sí le informamos del estado y de cada requerimiento.',
        ],
      },
      {
        q: '¿Pueden incluir a mi familia?',
        a: [
          'Si la categoría lo permite, sí: cónyuge, hijos y otros dependientes, con la documentación de parentesco apostillada o legalizada, y traducida cuando corresponda.',
        ],
      },
      {
        q: '¿Tramitan la nacionalidad panameña?',
        a: [
          'No. La naturalización y los trámites ante el Tribunal Electoral, el Registro Civil o Cedulación no forman parte de nuestros servicios.',
        ],
      },
    ],
    cta: {
      title: '¿Quiere saber qué vía de residencia le corresponde?',
      text: 'Cuéntenos su situación en pocas líneas. Le responderemos por el medio que indique con los siguientes pasos para evaluarla.',
      button: 'Evaluar mi residencia',
      whatsapp: 'Buenas, quiero evaluar mi residencia en Panamá.',
    },
  },

  // ----------------------------------------------------------------------
  permisos: {
    slug: s('permisos'),
    area: 'permisos_trabajo',
    num: '02',
    cardName: 'Permisos de trabajo',
    cardDesc:
      'Permiso aplicable, solicitudes y renovaciones, documentación del trabajador y del empleador.',
    title: 'Permisos de trabajo para extranjeros en Panamá | Juriscorp',
    description:
      'Permisos de trabajo para extranjeros en Panamá: evaluación del permiso aplicable, solicitudes y renovaciones, documentación del empleador y control de vencimientos.',
    schemaName: 'Permisos de trabajo para extranjeros en Panamá',
    breadcrumb: 'Permisos de trabajo',
    eyebrow: 'Servicio',
    h1: 'Permisos <em>de trabajo</em>',
    lead:
      'Para trabajar en Panamá, un extranjero necesita una autorización que no siempre viene incluida con la residencia. Le ayudamos a identificar el permiso que corresponde, a reunir la documentación del trabajador y de la empresa, y a no perder de vista los vencimientos.',
    audience: {
      label: 'A quién se dirige',
      value: 'Trabajadores extranjeros y empresas que los contratan',
      note: 'Si el trabajador y el empleador nos consultan por el mismo trámite, definimos desde el inicio a quién representamos.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'La autorización <em>y su documentación</em>',
      intro: 'El servicio cubre la autorización para trabajar y los documentos de la contratación.',
      items: [
        {
          title: 'Evaluación del permiso aplicable',
          text: 'Revisamos el perfil del trabajador, su estatus migratorio y el puesto, y le indicamos qué permiso corresponde y qué condiciones exige.',
        },
        {
          title: 'Solicitudes y renovaciones',
          text: 'Preparación y presentación de la solicitud ante el Ministerio de Trabajo y Desarrollo Laboral (MITRADEL), y renovaciones antes del vencimiento.',
        },
        {
          title: 'Documentación del trabajador y del empleador',
          text: 'Revisión de los documentos personales del trabajador y de los de la empresa que exige el trámite, para evitar observaciones que se pueden prevenir.',
        },
        {
          title: 'Contrato laboral de la contratación',
          text: 'Redacción o revisión del contrato de trabajo que acompaña la solicitud, coherente con el permiso y con la legislación laboral.',
        },
        {
          title: 'Seguimiento y vencimientos',
          text: 'Seguimiento del trámite hasta la resolución y calendario de vencimientos del permiso y de los documentos vinculados.',
        },
      ],
      excluded: {
        title: 'Fuera de este servicio',
        text: 'Litigios laborales, reclamaciones por despido y gestión de planillas o nómina. Tampoco garantizamos la aprobación del permiso ni su plazo.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Cómo llevamos <em>el trámite</em>',
      presence: {
        title: 'Canal del trámite y comparecencias',
        text: 'Según el tipo de permiso, la solicitud puede tener un canal en línea o presencial, y algunas etapas pueden requerir la presencia del trabajador o del representante de la empresa. El canal disponible se confirma para cada trámite durante la evaluación.',
      },
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo. Para empezar bastan estos datos:',
      items: [
        'Nacionalidad del trabajador y, si ya está en Panamá, su estatus migratorio.',
        'Puesto, funciones y fecha prevista de inicio.',
        'Datos generales de la empresa que contrata.',
        'Si es una renovación, la fecha de vencimiento del permiso actual.',
        'El contrato o la carta de oferta, si ya existen.',
      ],
      note: {
        title: 'No envíe documentos por el formulario',
        text: 'La lista definitiva depende del permiso y se entrega por escrito tras la evaluación.',
      },
    },
    faq: [
      {
        q: '¿Residencia y permiso de trabajo son lo mismo?',
        a: [
          'No. La residencia autoriza a permanecer en el país; el permiso de trabajo, a trabajar. Algunas categorías de residencia están ligadas a una relación laboral y otras no incluyen la autorización para trabajar.',
          `Lo revisamos caso por caso. Ver también <a href="/${s('residencia')}">Residencia y migración</a>.`,
        ],
      },
      {
        q: '¿Quién solicita el permiso, el trabajador o la empresa?',
        a: [
          'Depende del tipo de permiso. En muchos casos intervienen ambos y la empresa aporta documentación propia. Se lo indicamos en la evaluación.',
        ],
      },
      {
        q: '¿Qué pasa si el permiso vence?',
        a: [
          'Trabajar con el permiso vencido puede tener consecuencias para el trabajador y para el empleador. Por eso llevamos un control de vencimientos y preparamos la renovación con antelación.',
        ],
      },
      {
        q: '¿Atienden reclamos laborales o despidos?',
        a: [
          'No. Este servicio cubre la autorización para trabajar y la documentación de la contratación. Los litigios laborales no forman parte de nuestra oferta.',
        ],
      },
    ],
    cta: {
      title: '¿Va a trabajar en Panamá o a contratar a un extranjero?',
      text: 'Cuéntenos el caso en pocas líneas y le indicaremos qué permiso evaluar y qué documentos reunir.',
      button: 'Evaluar mi permiso de trabajo',
      whatsapp: 'Buenas, necesito información sobre un permiso de trabajo en Panamá.',
    },
  },

  // ----------------------------------------------------------------------
  relocalizacion: {
    slug: s('relocalizacion'),
    area: 'relocalizacion_legal',
    num: '03',
    cardName: 'Relocalización legal',
    cardDesc:
      'Un solo plan legal para mudarse: residencia, permiso de trabajo, vivienda y empresa.',
    title: 'Relocalización legal a Panamá | Juriscorp S.C.',
    description:
      'Acompañamiento jurídico para establecerse en Panamá: plan documental previo, residencia, permiso de trabajo, arrendamiento, compra de vivienda o empresa.',
    schemaName: 'Acompañamiento legal para establecerse en Panamá',
    breadcrumb: 'Relocalización legal',
    eyebrow: 'Servicio',
    h1: 'Relocalización <em>legal</em>',
    lead:
      'Mudarse a Panamá abre varios frentes legales a la vez: su estatus migratorio, quizá un permiso de trabajo, un contrato de arrendamiento o una compra, y a veces una empresa. Le ayudamos a ordenarlos en un solo plan y en el orden correcto, para que un trámite no frene al siguiente.',
    audience: {
      label: 'A quién se dirige',
      value: 'Personas y familias que planean establecerse en Panamá',
      note: 'Incluye a quienes trasladan una actividad profesional o empresarial.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'El componente legal <em>de la mudanza</em>',
      intro: 'Coordinamos lo jurídico. Lo logístico lo deciden usted y sus proveedores.',
      items: [
        {
          title: 'Plan documental antes de la mudanza',
          text: 'Qué documentos obtener, apostillar o traducir en su país antes de viajar, y en qué orden, para no repetir gestiones a distancia.',
        },
        {
          title: 'Residencia y permiso de trabajo',
          text: `Coordinación del componente migratorio y, si corresponde, del laboral, dentro del mismo plan. Detalle en <a href="/${s('residencia')}">Residencia</a> y <a href="/${s('permisos')}">Permisos de trabajo</a>.`,
        },
        {
          title: 'Revisión de arrendamientos',
          text: 'Revisión jurídica del contrato antes de firmar: duración, depósitos, causales de terminación y obligaciones de cada parte.',
        },
        {
          title: 'Orientación para comprar un inmueble',
          text: `Estudio de título y revisión del contrato antes de comprometerse. Detalle en <a href="/${s('contratos')}#inmuebles">Contratos, empresas e inmuebles</a>.`,
        },
        {
          title: 'Orientación para establecer una empresa',
          text: 'Qué estructura conviene evaluar y qué pasos legales implica, en coordinación con su asesor contable.',
        },
        {
          title: 'Calendario de gestiones y comparecencias',
          text: 'Organización de las gestiones legales y de las citas que requieren su presencia, para concentrarlas cuando sea posible.',
        },
      ],
      excluded: {
        title: 'Fuera de este servicio',
        text: 'Búsqueda de vivienda, mudanza, transporte, trámites de menaje, matrícula escolar y apertura de cuentas bancarias. Podemos revisar los documentos legales que esos proveedores le pidan, pero no prestamos esos servicios ni garantizamos su resultado. La aprobación de una cuenta depende exclusivamente del banco.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Un plan, <em>por etapas</em>',
      steps: [
        {
          title: 'Diagnóstico',
          text: 'Qué necesita resolver antes de llegar, al llegar y después. Revisamos conflictos de interés y le decimos qué podemos asumir.',
        },
        {
          title: 'Propuesta por escrito',
          text: 'Componentes incluidos, honorarios de cada uno y gastos de terceros por separado: tasas, apostillas, traducciones y notaría.',
        },
        {
          title: 'Preparación desde su país',
          text: 'Documentos, contratos y solicitudes se preparan a distancia, con su revisión.',
        },
        {
          title: 'Ejecución en Panamá',
          text: 'Presentaciones, firmas y citas según el calendario acordado, con seguimiento hasta cerrar cada componente.',
        },
      ],
      presence: {
        title: 'Habrá gestiones presenciales',
        text: 'Este servicio coordina varios trámites y algunos exigen su presencia en Panamá. Le entregamos un calendario con las comparecencias previstas para que pueda planificarlas.',
      },
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo. Para preparar el diagnóstico nos sirve saber:',
      items: [
        'País de residencia actual y nacionalidades de quienes se mudan.',
        'Fecha aproximada de la mudanza.',
        'Si trabajará en Panamá, invertirá, se jubilará o trasladará una empresa.',
        'Si piensa arrendar o comprar vivienda.',
        'Qué documentos tiene ya apostillados o traducidos.',
      ],
      note: {
        title: 'No envíe documentos por el formulario',
        text: 'Le indicaremos por escrito qué documentos preparar y por qué canal enviarlos.',
      },
    },
    faq: [
      {
        q: '¿Ustedes me buscan vivienda u organizan la mudanza?',
        a: [
          'No. Nuestro servicio es el componente legal. Podemos revisar el contrato de arrendamiento o de compra que usted elija, pero la búsqueda de vivienda y la logística quedan fuera.',
        ],
      },
      {
        q: '¿Puedo empezar antes de viajar?',
        a: [
          'Sí, y es lo recomendable. Muchos documentos se obtienen y apostillan más fácilmente en su país de origen que a distancia, una vez instalado en Panamá.',
        ],
      },
      {
        q: '¿Pueden abrirme una cuenta bancaria?',
        a: [
          'No. La apertura de cuentas depende de las políticas de cada banco. Podemos orientarle sobre los documentos legales que suelen pedir, sin garantizar la aprobación.',
        ],
      },
      {
        q: '¿Este servicio incluye la residencia?',
        a: [
          'La coordina como parte del plan. Qué componentes incluye su caso y cuánto cuesta cada uno se fija en la propuesta escrita.',
        ],
      },
    ],
    cta: {
      title: '¿Está planificando su mudanza a Panamá?',
      text: 'Cuéntenos cuándo y con quién piensa establecerse. Le propondremos un plan legal por etapas.',
      button: 'Planificar mi relocalización',
      whatsapp: 'Buenas, estoy planificando mudarme a Panamá y necesito orientación legal.',
    },
  },

  // ----------------------------------------------------------------------
  contratos: {
    slug: s('contratos'),
    area: 'contratos_empresas_inmuebles',
    num: '04',
    cardName: 'Contratos, empresas e inmuebles',
    cardDesc:
      'Contratos, acuerdos entre socios, documentación societaria, poderes y estudios de título.',
    title: 'Contratos, empresas e inmuebles en Panamá | Juriscorp S.C.',
    description:
      'Redacción y revisión de contratos, acuerdos entre socios, documentación societaria y poderes, estudios de título y revisión de compraventas y arrendamientos en Panamá.',
    schemaName: 'Contratos, documentación empresarial y revisión inmobiliaria en Panamá',
    breadcrumb: 'Contratos, empresas e inmuebles',
    eyebrow: 'Servicio',
    h1: 'Contratos, empresas <em>e inmuebles</em>',
    lead:
      'Muchos conflictos se evitan con un documento bien redactado y revisado a tiempo. Preparamos y revisamos contratos, documentación societaria y operaciones inmobiliarias para que usted firme sabiendo qué asume. Es un trabajo que se hace sobre todo por escrito y por videoconferencia.',
    audience: {
      label: 'A quién se dirige',
      value: 'Personas, empresas, propietarios e inversionistas',
      note: 'En Panamá o desde el exterior, con operaciones o documentos sujetos a la ley panameña.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'Tres frentes, <em>un mismo criterio</em>',
      intro: 'Revisar antes de firmar cuesta menos que discutir después.',
      items: [
        {
          id: 'contratos',
          title: 'Elaboración y revisión de contratos',
          text: 'Prestación de servicios, compraventa, arrendamiento, confidencialidad y otros acuerdos civiles y mercantiles. Revisión de cláusulas y riesgos, y negociación del texto por escrito.',
        },
        {
          title: 'Acuerdos entre socios',
          text: 'Aportes, administración, toma de decisiones, salida de socios y forma de resolver desacuerdos.',
        },
        {
          id: 'empresas',
          title: 'Documentación societaria',
          text: 'Actas, resoluciones y actualización de la documentación corporativa, con coordinación de la protocolización ante notaría y la inscripción en el Registro Público.',
        },
        {
          title: 'Constitución y reformas de sociedades',
          text: 'Constitución de sociedades y modificaciones de su pacto social, con el alcance que se defina en la propuesta.',
        },
        {
          title: 'Poderes',
          text: 'Redacción de poderes generales y especiales, y coordinación de su otorgamiento, apostilla cuando se usan en el exterior e inscripción cuando corresponde.',
        },
        {
          id: 'inmuebles',
          title: 'Estudio de título y debida diligencia',
          text: 'Revisión del historial registral de la finca, gravámenes, limitaciones y situación del vendedor antes de comprometerse.',
        },
        {
          title: 'Compraventas y arrendamientos',
          text: 'Revisión de promesas de compraventa, contratos de compraventa y arrendamientos, y coordinación del cierre con notaría y Registro Público.',
        },
      ],
      excluded: {
        title: 'Fuera de este servicio',
        text: 'Servicio de agente residente y obligaciones corporativas recurrentes; litigios de propiedad, disputas de linderos, titulación de tierras y procesos agrarios; contabilidad y asesoría fiscal integral.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Por escrito, <em>con revisión suya</em>',
      presence: {
        title: 'Firmas y notaría',
        text: 'La mayor parte se resuelve por escrito. El otorgamiento de escrituras o poderes ante notario puede exigir la comparecencia de los firmantes o un poder previo; se lo indicamos antes de agendar la firma o el cierre.',
      },
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo. Según el asunto, nos sirve saber:',
      items: [
        'Qué tipo de contrato u operación es, y si ya hay un borrador.',
        'Quiénes son las partes y dónde residen.',
        'En sociedades: el nombre de la sociedad y qué cambio necesita.',
        'En inmuebles: los datos de la propiedad y en qué etapa está la negociación.',
        'La fecha prevista de firma o cierre.',
      ],
      note: {
        title: 'El borrador, después',
        text: 'Si hay un borrador que revisar, se lo pediremos por un canal acordado tras la evaluación. No lo pegue completo en el formulario.',
      },
    },
    faq: [
      {
        q: '¿Pueden revisar un contrato si estoy fuera de Panamá?',
        a: [
          'Sí. La revisión y la negociación del texto se hacen por escrito y por videoconferencia. Lo que puede exigir presencia, o un poder, es la firma ante notario cuando la operación la requiere.',
        ],
      },
      {
        q: '¿Qué es un estudio de título y cuándo conviene hacerlo?',
        a: [
          'Es la revisión del historial registral del inmueble: quién es el titular, qué gravámenes o limitaciones tiene y si hay algo que impida la venta. Conviene hacerlo antes de firmar una promesa o entregar dinero.',
        ],
      },
      {
        q: '¿Ofrecen servicio de agente residente?',
        a: [
          'No forma parte de nuestra oferta actual. Podemos revisar la documentación de su sociedad y preparar actas o poderes, pero no asumimos el servicio de agente residente ni las obligaciones corporativas recurrentes.',
        ],
      },
      {
        q: '¿Atienden disputas de propiedad o de linderos?',
        a: [
          'No. Nuestro trabajo inmobiliario es preventivo y documental: estudio de títulos y revisión de contratos. Los litigios de propiedad, las disputas de linderos y los procesos agrarios quedan fuera.',
        ],
      },
    ],
    cta: {
      title: '¿Tiene un contrato o una operación por revisar?',
      text: 'Cuéntenos de qué se trata y cuándo piensa firmar. Le diremos qué revisión recomendamos y qué necesitaremos.',
      button: 'Revisar mi contrato',
      whatsapp: 'Buenas, necesito revisar un contrato o una operación en Panamá.',
    },
  },

  // ----------------------------------------------------------------------
  administrativo: {
    slug: s('administrativo'),
    area: 'administrativo_tributario',
    num: '05',
    cardName: 'Derecho administrativo',
    cardDesc:
      'Peticiones, recursos, defensa frente a sanciones, permisos, licencias y contratación pública.',
    title: 'Derecho administrativo en Panamá | Juriscorp S.C.',
    description:
      'Peticiones, seguimiento de expedientes, recursos administrativos, defensa frente a sanciones, permisos, licencias y revisión de contrataciones públicas en Panamá.',
    schemaName: 'Derecho administrativo en Panamá',
    breadcrumb: 'Derecho administrativo',
    eyebrow: 'Administrativo y tributario',
    h1: 'Derecho <em>administrativo</em>',
    lead:
      'Cuando la contraparte es una entidad pública, el procedimiento pesa tanto como el fondo. Un plazo vencido o un recurso mal planteado puede cerrar la puerta antes de que alguien examine si usted tenía razón. Atendemos asuntos administrativos seleccionados, con énfasis en el trabajo escrito: peticiones, recursos y defensa documental.',
    heroNote: 'Formación: Maestría en Derecho Administrativo.',
    audience: {
      label: 'A quién se dirige',
      value: 'Personas y empresas frente a trámites, sanciones o decisiones de entidades públicas',
      note: 'Incluye a inversionistas extranjeros con permisos, licencias o contratos con el Estado panameño.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'Actuaciones ante <em>la administración pública</em>',
      intro: 'Cada asunto tiene su propia vía y sus propios plazos. Estas son las actuaciones que asumimos, tras evaluar cada caso.',
      items: [
        {
          title: 'Peticiones y solicitudes documentales',
          text: 'Peticiones ante entidades públicas, solicitudes de copias y certificaciones, y de acceso a la información pública.',
        },
        {
          title: 'Seguimiento de expedientes',
          text: 'Revisión del estado de un trámite, del contenido del expediente y de los plazos que están corriendo.',
        },
        {
          title: 'Recursos administrativos',
          text: 'Recursos de reconsideración y de apelación contra actos que le afectan, cuando el procedimiento aplicable los prevé.',
        },
        {
          title: 'Defensa documental frente a sanciones',
          text: 'Descargos y recursos frente a multas, cierres u otras sanciones, con atención a la notificación, al derecho a ser oído y a la motivación del acto.',
        },
        {
          title: 'Permisos y licencias',
          text: 'Solicitudes, renovaciones y defensa de permisos, licencias y autorizaciones ante entidades públicas y municipios.',
        },
        {
          title: 'Revisión jurídica de contratación pública',
          text: 'Revisión de pliegos y documentos de participación, y preparación de reclamos o impugnaciones en los asuntos que aceptamos.',
        },
      ],
      excluded: {
        title: 'Si el asunto debe llegar a la Corte',
        text: `Las demandas ante la Sala Tercera de la Corte Suprema se tratan en <a href="/${s('constitucional')}">Constitucional y contencioso-administrativo</a>, siempre después de un estudio de viabilidad.`,
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Primero el plazo, <em>después el fondo</em>',
      presence: {
        title: 'Trabajo escrito, con diligencias evaluadas',
        text: 'La mayor parte de estas actuaciones es escrita. Algunas diligencias, como la revisión física de un expediente o ciertas audiencias, pueden requerir presencia. Lo evaluamos antes de aceptar el asunto y le indicamos cómo se cubrirán.',
      },
    },
    institutions: {
      title: 'El mapa institucional',
      intro: 'El procedimiento administrativo general se rige por la Ley 38 de 2000, junto con la normativa propia de cada sector.',
      items: [
        {
          mark: '—',
          title: 'Ministerios, entidades autónomas y municipios',
          text: 'Cada uno con su procedimiento y sus plazos. Es donde empieza casi todo asunto administrativo.',
        },
        {
          mark: 'DGCP',
          title: 'Dirección General de Contrataciones Públicas',
          text: 'Rectora del sistema de compras del Estado y administradora de PanamaCompra.',
        },
        {
          mark: 'TACP',
          title: 'Tribunal Administrativo de Contrataciones Públicas',
          text: 'Resuelve impugnaciones contra actos de los procedimientos de selección de contratista.',
        },
        {
          mark: 'ANTAI',
          title: 'Autoridad Nacional de Transparencia y Acceso a la Información',
          text: 'Vía para hacer efectivo el acceso a la información pública, útil para reunir un expediente.',
        },
        {
          mark: 'PA',
          title: 'Procuraduría de la Administración',
          text: 'Emite consultas que orientan a las entidades públicas e interviene en los procesos contencioso-administrativos.',
        },
        {
          mark: 'CSJ',
          title: 'Sala Tercera de la Corte Suprema',
          text: 'Revisa la legalidad de los actos de la administración mediante demandas contencioso-administrativas.',
        },
      ],
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo. Para saber si hay margen de actuación necesitamos:',
      items: [
        'Qué entidad emitió la resolución, la sanción o el requerimiento.',
        'La fecha en que se le notificó. Indíquela también en el formulario.',
        'Qué quiere obtener: anular, modificar, obtener un permiso o responder.',
        'Los recursos o escritos que ya haya presentado.',
      ],
      note: {
        title: 'Si hay un plazo corriendo, dígalo primero',
        text: 'Marque en el formulario que tiene una notificación o fecha límite. La copia de la resolución se la pediremos por un canal acordado; no la adjunte en la consulta web.',
      },
    },
    faq: [
      {
        q: '¿Siempre hay que agotar la vía gubernativa antes de acudir a la Corte?',
        a: [
          'No en todos los casos. Depende de la acción y del procedimiento. Algunas acciones exigen haber usado antes los recursos administrativos disponibles y están sujetas a plazo; otras no lo exigen, y la ley y la jurisprudencia reconocen excepciones.',
          'Por eso el primer paso es identificar qué se impugna y con qué vía. Decidirlo mal puede hacer que la demanda se rechace sin examinar el fondo.',
        ],
      },
      {
        q: '¿Cuánto tiempo tengo para recurrir una resolución?',
        a: [
          'Lo fija la norma de cada procedimiento. Los plazos suelen ser breves y se cuentan desde la notificación; una vez vencidos, la decisión puede quedar en firme.',
          'Consulte en cuanto reciba la notificación e indique la fecha en su consulta.',
        ],
      },
      {
        q: '¿Puedo impugnar la adjudicación de una licitación?',
        a: [
          'El régimen de contrataciones públicas prevé reclamos e impugnaciones con plazos cortos y requisitos propios. Conviene revisar el pliego y el expediente cuanto antes. Evaluamos la viabilidad antes de aceptar el asunto.',
        ],
      },
      {
        q: '¿Atienden a extranjeros con asuntos administrativos en Panamá?',
        a: [
          'Sí. La evaluación puede hacerse a distancia y la representación se formaliza mediante poder. Algunas actuaciones pueden requerir presencia; se lo indicamos antes de comprometer el encargo.',
        ],
      },
    ],
    cta: {
      title: '¿Recibió una resolución o un requerimiento que le afecta?',
      text: 'Cuéntenos el caso en términos generales y la fecha de notificación. Le diremos si vemos margen de actuación y qué se necesita para evaluarlo.',
      button: 'Evaluar una resolución administrativa',
      whatsapp: 'Buenas, recibí una resolución administrativa y necesito evaluarla.',
    },
  },

  // ----------------------------------------------------------------------
  tributario: {
    slug: s('tributario'),
    area: 'administrativo_tributario',
    num: '05',
    cardName: 'Derecho tributario',
    cardDesc: 'Consultas, respuesta a requerimientos de la DGI y recursos ante la DGI y el TAT.',
    title: 'Derecho tributario en Panamá | Juriscorp S.C.',
    description:
      'Consultas y recursos tributarios en Panamá: requerimientos y fiscalizaciones de la DGI, sanciones y recursos ante la DGI y el Tribunal Administrativo Tributario.',
    schemaName: 'Consultas y recursos tributarios en Panamá',
    breadcrumb: 'Derecho tributario',
    eyebrow: 'Administrativo y tributario',
    h1: 'Derecho <em>tributario</em>',
    lead:
      'Una discusión con la administración tributaria rara vez se gana solo con cifras. Se gana con el expediente bien construido, la norma bien invocada y el recurso presentado a tiempo. Atendemos consultas y recursos tributarios seleccionados, y coordinamos con su contador cuando el asunto exige trabajo contable.',
    heroNote:
      'Experiencia institucional: ex asistente de Magistrado del Tribunal Administrativo Tributario.',
    audience: {
      label: 'A quién se dirige',
      value: 'Contribuyentes y empresas con requerimientos, liquidaciones o sanciones tributarias',
      note: 'También a quienes necesitan una opinión jurídica antes de realizar una operación.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'Asuntos ante <em>la administración tributaria</em>',
      intro: 'Trabajo jurídico. Lo contable lo realiza su contador o un especialista, en coordinación con nosotros.',
      items: [
        {
          title: 'Consultas y opiniones tributarias',
          text: 'Análisis jurídico de una operación o situación concreta; por ejemplo, si una renta es de fuente panameña según el principio de territorialidad.',
        },
        {
          title: 'Requerimientos y fiscalizaciones',
          text: 'Preparación de la respuesta a requerimientos de información, alcances y liquidaciones adicionales, con el soporte documental de la posición del contribuyente.',
        },
        {
          title: 'Recursos ante la DGI y el TAT',
          text: 'Reconsideración ante la Dirección General de Ingresos y apelación ante el Tribunal Administrativo Tributario, cuando proceden.',
        },
        {
          title: 'Sanciones tributarias',
          text: 'Defensa documental frente a multas y recargos.',
        },
        {
          title: 'Prescripción y devoluciones',
          text: 'Análisis de si una obligación sigue siendo exigible, y solicitudes de devolución o de reconocimiento de créditos.',
        },
      ],
      excluded: {
        title: 'Fuera de este servicio',
        text: 'Contabilidad, preparación de declaraciones, estudios de precios de transferencia y planificación fiscal integral. Cuando el asunto los requiere, se coordina con su contador o con un especialista, y así consta en la propuesta.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Revisar <em>antes de contestar</em>',
      presence: {
        title: 'Trabajo mayoritariamente escrito',
        text: 'Las respuestas y los recursos tributarios son escritos. Si alguna diligencia requiere presencia, lo identificamos en la evaluación.',
      },
    },
    institutions: {
      title: 'Las instancias',
      intro: 'El régimen panameño grava, como regla general, la renta producida dentro del territorio nacional: el principio de territorialidad.',
      items: [
        {
          mark: 'DGI',
          title: 'Dirección General de Ingresos',
          text: 'Fiscaliza, liquida y cobra. Es la primera instancia de casi cualquier discusión tributaria nacional.',
        },
        {
          mark: 'TAT',
          title: 'Tribunal Administrativo Tributario',
          text: 'Tribunal independiente de la DGI que resuelve en segunda instancia administrativa las apelaciones contra sus decisiones.',
        },
        {
          mark: 'CSJ',
          title: 'Sala Tercera de la Corte Suprema',
          text: 'Revisa judicialmente lo decidido en sede administrativa, mediante la acción que corresponda.',
        },
        {
          mark: '—',
          title: 'Municipios',
          text: 'Impuestos y tasas locales con su propio procedimiento.',
        },
      ],
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo:',
      items: [
        'Qué recibió: requerimiento, alcance, liquidación, multa o resolución.',
        'La fecha de notificación. Indíquela también en el formulario.',
        'El impuesto y el período al que se refiere.',
        'Si cuenta con contador, cómo contactarlo.',
        'Las respuestas o recursos que ya se hayan presentado.',
      ],
      note: {
        title: 'Datos fiscales, después',
        text: 'No incluya estados financieros ni números de identificación tributaria en la consulta web. Si hacen falta, se los pediremos por un canal acordado.',
      },
    },
    faq: [
      {
        q: '¿Desde cuándo corre el plazo para recurrir?',
        a: [
          'En general, desde la notificación del acto, y se cuenta según la norma del procedimiento. Indique la fecha de notificación en su consulta para revisarlo de inmediato.',
        ],
      },
      {
        q: '¿Debo contestar un requerimiento de la DGI antes de consultarlo?',
        a: [
          'Conviene revisarlo antes. Una respuesta sin análisis puede consolidar el criterio de la administración y estrechar el margen de defensa posterior.',
        ],
      },
      {
        q: '¿Llevan la contabilidad o presentan declaraciones?',
        a: [
          'No. Nuestro trabajo es jurídico. Cuando hace falta trabajo contable, lo realiza su contador o un especialista, en coordinación con nosotros.',
        ],
      },
      {
        q: '¿Qué significa el principio de territorialidad?',
        a: [
          'Que Panamá grava, como regla general, la renta producida dentro de su territorio. Determinar si una operación genera renta de fuente panameña es una de las discusiones más frecuentes con la administración.',
        ],
      },
    ],
    cta: {
      title: '¿Recibió un requerimiento o una resolución tributaria?',
      text: 'Cuéntenos qué recibió y cuándo se lo notificaron. Le diremos qué se puede hacer y qué necesitamos para evaluarlo.',
      button: 'Evaluar mi asunto tributario',
      whatsapp: 'Buenas, recibí un requerimiento o una resolución tributaria y necesito orientación.',
    },
  },

  // ----------------------------------------------------------------------
  constitucional: {
    slug: s('constitucional'),
    area: 'constitucional_contencioso',
    num: '06',
    cardName: 'Constitucional y contencioso-administrativo',
    cardDesc:
      'Estudios de viabilidad y demandas ante el Pleno o la Sala Tercera de la Corte Suprema.',
    title: 'Constitucional y contencioso-administrativo | Juriscorp',
    description:
      'Estudios de viabilidad, demandas de inconstitucionalidad ante el Pleno y demandas contencioso-administrativas de nulidad y plena jurisdicción ante la Sala Tercera.',
    schemaName: 'Derecho constitucional y contencioso-administrativo en Panamá',
    breadcrumb: 'Constitucional y contencioso-administrativo',
    eyebrow: 'Servicio',
    h1: 'Constitucional y <em>contencioso-administrativo</em>',
    lead:
      'Algunas decisiones del Estado solo pueden corregirse ante la Corte Suprema de Justicia. Son asuntos técnicos, con requisitos formales estrictos, en los que conviene saber si hay posibilidades reales antes de invertir en una demanda. Por eso el trabajo empieza siempre con un estudio de viabilidad.',
    heroNote: 'Formación: Maestría en Derecho Administrativo.',
    audience: {
      label: 'A quién se dirige',
      value: 'Personas y empresas afectadas por un acto administrativo o por una norma',
      note: 'También a quienes necesitan una segunda opinión sobre un expediente en curso.',
    },
    scope: {
      tag: 'Qué incluye',
      title: 'Del estudio <em>a la demanda</em>',
      intro: 'Aceptamos cada asunto después de evaluar su alcance, sus plazos y lo que exigirá el proceso.',
      items: [
        {
          title: 'Estudio de viabilidad',
          text: 'Análisis del acto o de la norma, de la acción que procede, de sus requisitos y plazos, y de los argumentos disponibles. Termina con una recomendación por escrito.',
        },
        {
          title: 'Demandas de inconstitucionalidad',
          text: 'Preparación y presentación ante el Pleno de la Corte Suprema de Justicia, en los asuntos aceptados tras el estudio.',
        },
        {
          title: 'Demandas de nulidad',
          text: 'Impugnación ante la Sala Tercera de actos administrativos contrarios a la ley.',
        },
        {
          title: 'Demandas de plena jurisdicción',
          text: 'Restablecimiento ante la Sala Tercera de derechos lesionados por una decisión administrativa.',
        },
        {
          title: 'Medidas cautelares',
          text: 'Solicitud de suspensión provisional de los efectos del acto, cuando procede y se justifica.',
        },
        {
          title: 'Opiniones jurídicas y revisión de expedientes',
          text: 'Segunda opinión sobre un caso en curso y revisión técnica de escritos y expedientes.',
        },
      ],
      excluded: {
        title: 'Lo que no prometemos',
        text: 'La admisión y la decisión corresponden a la Corte. No garantizamos resultados ni plazos, y no aceptamos un asunto sin el estudio previo.',
      },
    },
    process: {
      tag: 'Forma de trabajo',
      title: 'Viabilidad primero, <em>demanda después</em>',
      steps: [
        {
          title: 'Consulta inicial',
          text: 'Identificamos el acto o la norma, la fecha de notificación o publicación y lo que usted busca. Revisamos conflictos de interés.',
        },
        {
          title: 'Estudio de viabilidad',
          text: 'Acción procedente, requisitos, plazos, pruebas y diligencias previsibles. Recomendación por escrito.',
        },
        {
          title: 'Propuesta y demanda',
          text: 'Si recomendamos actuar y usted acepta la propuesta, preparamos la demanda y, cuando procede, la solicitud cautelar.',
        },
        {
          title: 'Seguimiento procesal',
          text: 'Atención de traslados, escritos y notificaciones hasta la decisión, con reporte de cada actuación.',
        },
      ],
      presence: {
        title: 'Proceso escrito no es proceso sin presencia',
        text: 'Que un proceso sea mayoritariamente escrito no significa que no requiera actuaciones presenciales. Antes de aceptarlo identificamos notificaciones, pruebas y diligencias, y le indicamos cómo se atenderán.',
      },
    },
    institutions: {
      title: 'Dos jurisdicciones distintas',
      intro: 'No son instancias sucesivas de un mismo litigio. Cada una conoce de acciones propias, con requisitos propios.',
      items: [
        {
          mark: 'Pleno',
          title: 'Pleno de la Corte Suprema de Justicia',
          text: 'Conoce de las demandas de inconstitucionalidad contra leyes, decretos, actos y otras disposiciones, por razones de fondo o de forma.',
        },
        {
          mark: 'Sala 3.ª',
          title: 'Sala Tercera de lo Contencioso-Administrativo',
          text: 'Conoce de las demandas contra actos de la administración pública, entre ellas las de nulidad y de plena jurisdicción.',
        },
        {
          mark: 'PA',
          title: 'Procuraduría de la Administración',
          text: 'Interviene en los procesos contencioso-administrativos, según el tipo de acción.',
        },
      ],
    },
    documents: {
      tag: 'Para la evaluación inicial',
      title: 'Qué tener <em>a mano</em>',
      intro: 'Orientativo:',
      items: [
        'Qué acto o norma le afecta y quién lo emitió.',
        'La fecha de notificación o de publicación. Indíquela también en el formulario.',
        'Los recursos que ya se hayan presentado y su resultado.',
        'Qué busca: anular el acto, restablecer un derecho o que se declare inconstitucional una norma.',
      ],
      note: {
        title: 'El expediente, después',
        text: 'Si el asunto avanza al estudio de viabilidad, le pediremos el expediente por un canal acordado. No lo adjunte en la consulta web.',
      },
    },
    faq: [
      {
        q: '¿Es lo mismo una demanda de inconstitucionalidad que una contencioso-administrativa?',
        a: [
          'No. La de inconstitucionalidad la conoce el Pleno de la Corte Suprema y busca que se declare que una norma o un acto contraría la Constitución. Las contencioso-administrativas, como la de nulidad o la de plena jurisdicción, las conoce la Sala Tercera y versan sobre la legalidad de actos de la administración.',
        ],
      },
      {
        q: '¿Es la “última instancia” de mi caso?',
        a: [
          'No necesariamente. Una demanda contencioso-administrativa puede ser la primera vez que un asunto llega a un tribunal, y una demanda de inconstitucionalidad no es un recurso contra una sentencia anterior. Son procesos con requisitos propios.',
        ],
      },
      {
        q: '¿Qué diferencia hay entre nulidad y plena jurisdicción?',
        a: [
          'La de plena jurisdicción busca restablecer un derecho subjetivo lesionado y puede incluir una reparación; está sujeta a plazo y a requisitos previos. La de nulidad persigue que se anule un acto contrario a la ley.',
          'La elección depende de qué se quiere obtener y del tiempo transcurrido. Se define en el estudio de viabilidad.',
        ],
      },
      {
        q: '¿Garantizan que la Corte admita la demanda?',
        a: [
          'No. La admisión y la decisión corresponden a la Corte. Lo que sí hacemos es decirle con franqueza, en el estudio de viabilidad, si recomendamos presentarla.',
        ],
      },
    ],
    cta: {
      title: '¿Quiere saber si su caso puede llevarse a la Corte?',
      text: 'Cuéntenos qué acto o norma le afecta y cuándo se notificó o publicó. Le indicaremos si conviene un estudio de viabilidad.',
      button: 'Solicitar un estudio de viabilidad',
      whatsapp: 'Buenas, quiero evaluar si mi caso puede llevarse a la Corte Suprema.',
    },
  },
};

export default { ui, defaultSteps, pages };
