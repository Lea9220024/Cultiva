import { EncyclopediaArticle, OfficialSource } from "../types";

export const ENCYCLOPEDIA_SOURCES: Record<string, OfficialSource> = {
  fao: {
    id: "src_fao",
    title: "FAO — Directrices de Manejo de Agua y Nutrientes en Cultivos",
    publisher: "Organización de las Naciones Unidas para la Alimentación y la Agricultura (FAO)",
    url: "https://www.fao.org/land-water/databases-and-software/crop-information/en/",
    consultationDate: "18/08/2026",
    reliability: "🟢 Fuente oficial",
    description: "Publicaciones agronómicas internacionales sobre salinidad, pH del suelo y dinámica hídrica en sistemas vegetales controlados.",
  },
  uc_davis: {
    id: "src_uc_davis",
    title: "UC Davis Postharvest Technology Center & Plant Nutrition",
    publisher: "University of California, Davis",
    url: "https://postharvest.ucdavis.edu",
    consultationDate: "18/08/2026",
    reliability: "🟢 Fuente oficial",
    description: "Investigaciones científicas revisadas por pares sobre procesos de curado, secado higroscópico y nutrición vegetal.",
  },
  canadian_ag: {
    id: "src_canadian_ag",
    title: "Agriculture and Agri-Food Canada — Horticulture Best Practices",
    publisher: "Gobierno de Canadá / Agri-Food Canada",
    url: "https://agriculture.canada.ca",
    consultationDate: "18/08/2026",
    reliability: "🟢 Fuente oficial",
    description: "Normativas técnicas y manuales de buenas prácticas de cultivo en invernadero, iluminación LED y bioseguridad.",
  },
  top_crop_tech: {
    id: "src_top_crop_tech",
    title: "Guías Técnicas de Fertilización y Parámetros Fisicoquímicos",
    publisher: "Top Crop Hydroponics S.L.",
    url: "https://www.topcrop.biz",
    consultationDate: "18/08/2026",
    reliability: "🟢 Fuente oficial",
    description: "Fichas técnicas oficiales sobre solubilidad, ácidos húmicos, EC y compatibilidad nutricional en sustratos.",
  },
  journal_horticulture: {
    id: "src_journal_hort",
    title: "International Journal of Horticultural Science",
    publisher: "Sociedad Internacional de Ciencias Hortícolas (ISHS)",
    url: "https://www.actahort.org",
    consultationDate: "18/08/2026",
    reliability: "🔵 Fuente técnica",
    description: "Artículos académicos sobre déficit de presión de vapor (VPD), espectro fotónico lumínico y asimilación de microelementos.",
  },
  inapi_inta: {
    id: "src_inta",
    title: "INTA — Guía de Manejo Integrado de Plagas y Suelos Vivos",
    publisher: "Instituto Nacional de Tecnología Agropecuaria (INTA)",
    url: "https://inta.gob.ar",
    consultationDate: "18/08/2026",
    reliability: "🟢 Fuente oficial",
    description: "Manuales de control biológico con insectos benéficos, trichodermas y manejo orgánico de patógenos vegetales.",
  },
};

export const ENCYCLOPEDIA_ARTICLES: EncyclopediaArticle[] = [
  // 1. BIOLOGÍA / PRINCIPIANTE
  {
    id: "bio_ciclo_vida",
    title: "Ciclo de Vida y Fases del Desarrollo Vegetal",
    slug: "ciclo-de-vida-vegetal",
    level: "Principiante",
    levelDifficulty: "🟢 Fácil",
    category: "biologia",
    categoryLabel: "🌱 Biología",
    categoryIcon: "🌱",
    stageRelation: ["Germinación", "Plántula", "Vegetativo", "Floración"],
    summary: "Comprende la transición biológica desde que la semilla despierta hasta la maduración de los frutos y la cosecha.",
    definition: "El ciclo de vida de las plantas anuales abarca una sucesión ordenada de fases: germinación, plántula, crecimiento vegetativo, floración y senescencia/cosecha.",
    content: `El ciclo vegetal comprende dos estados morfológicos fundamentales: la fase de crecimiento vegetativo y la fase reproductiva (floración).

1. Germinación y Plántula (Días 1 a 14)
La semilla rompe su cubierta (testa) mediante imbibición de agua, desplegando la radícula hacia abajo y los cotiledones hacia la luz. En esta etapa la planta es vulnerable a la desecación y a los excesos de humedad ("damping-off").

2. Fase Vegetativa (Semanas 2 a 6+)
Bajo fotoperiodos largos (18 horas de luz / 6 de oscuridad en interior), la planta concentra su energía en expandir su sistema radicular, formar nudos, tallos fuertes y masa foliar capaz de realizar fotosíntesis activa.

3. Transición y Floración
Al percibir noches más largas (12/12 en fotoperiódicas) o alcanzar la madurez genética (autoflorecientes), se desencadena una cascada hormonal (fitocromo Pfr/Pr) que orienta los recursos a la producción de racimos florales, tricomas y resinas protectoras.

4. Maduración y Cosecha
Las flores compactan, los cálices engrosan y los pistilos/tricomas maduran indicando el momento óptimo de recolección.`,
    keyTakeaways: [
      "Cada etapa tiene requerimientos específicos de luz, humedad y macronutrientes.",
      "El fotoperiodo 18/6 sostiene el estado vegetativo; 12/12 induce la floración en plantas fotoperiódicas.",
      "Las plantas autoflorecientes florecen por edad biológica (generalmente día 21 a 28), independientemente de las horas de luz.",
    ],
    nextContentId: "riego_ph_basico",
    nextContentTitle: "¿Qué es el pH y por qué es vital en el riego?",
    relatedArticleIds: ["amb_fotoperiodo", "nut_npk_fundamentos", "etapas_trasplante"],
    sources: [ENCYCLOPEDIA_SOURCES.uc_davis, ENCYCLOPEDIA_SOURCES.canadian_ag],
    tags: ["ciclo", "germinacion", "vegetativo", "floracion", "fotoperiodo"],
    readTimeMinutes: 4,
  },

  // 2. RIEGO / PRINCIPIANTE
  {
    id: "riego_ph_basico",
    title: "¿Qué es el pH y por qué determina la salud radicular?",
    slug: "que-es-el-ph",
    level: "Principiante",
    levelDifficulty: "🟢 Fácil",
    category: "riego",
    categoryLabel: "💧 Agua y riego",
    categoryIcon: "💧",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "El pH (potencial de hidrógeno) regula la disponibilidad química de los nutrientes en la solución del sustrato.",
    definition: "El pH es una escala logarítmica de 0 a 14 que mide la acidez o alcalinidad. En sustratos de tierra, el rango óptimo de absorción se ubica entre 6.0 y 6.8.",
    content: `Aunque un sustrato contenga abundantes fertilizantes, si el pH del agua de riego es inadecuado, las raíces no pueden absorberlos. Este fenómeno se denomina "bloqueo de nutrientes" (nutrient lockout).

¿Por qué ocurre el bloqueo?
Los elementos químicos (nitrógeno, fósforo, potasio, hierro, etc.) cambian su estado de ionización según el pH. 
- Si el pH baja de 5.5 en tierra: se bloquea la absorción de fósforo, calcio y magnesio.
- Si el pH sube de 7.0 en tierra: se precipitan el hierro, zinc, manganeso y cobre, provocando clorosis y manchas interfoliares.

Rangos de referencia recomendados por la literatura técnica:
- Sustrato de Tierra: pH 6.0 a 6.8 (promedio ideal: 6.3 - 6.5)
- Sustrato de Coco / Hidroponía: pH 5.6 a 6.2 (promedio ideal: 5.8)

Regla de oro:
Mide y ajusta el pH SIEMPRE después de haber añadido y mezclado todos los fertilizantes al agua de riego, ya que la mayoría de los nutrientes alteran la acidez del caldo.`,
    keyTakeaways: [
      "El pH incorrecto simula deficiencias nutricionales aunque el suelo tenga abono.",
      "Ajustar el pH tras agregar todos los abonos a la mezcla de agua.",
      "Un medidor digital calibrado o gotas reactivas son herramientas esenciales.",
    ],
    nextContentId: "nut_ec_explicacion",
    nextContentTitle: "¿Qué es la Electroconductividad (EC)?",
    relatedArticleIds: ["nut_ec_explicacion", "sust_tierra_vs_coco", "nut_npk_fundamentos"],
    sources: [ENCYCLOPEDIA_SOURCES.fao, ENCYCLOPEDIA_SOURCES.top_crop_tech],
    tags: ["ph", "riego", "acidez", "bloqueo", "absorcion"],
    readTimeMinutes: 5,
  },

  // 3. NUTRICIÓN / INTERMEDIO
  {
    id: "nut_ec_explicacion",
    title: "¿Qué significa la Electroconductividad (EC) y cómo interpretarla?",
    slug: "electroconductividad-ec-nutricion",
    level: "Intermedio",
    levelDifficulty: "🟡 Intermedio",
    category: "nutricion",
    categoryLabel: "🧪 Nutrición",
    categoryIcon: "🧪",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "Aprende a medir la concentración total de sales disueltas en el agua de riego para evitar carencias o sobrefertilizaciones.",
    definition: "La Electroconductividad (EC) mide la capacidad de una solución acuosa para conducir la corriente eléctrica, proporcional a la concentración de iones minerales disueltos (sales de fertilizantes). Se expresa en milisiemens por centímetro (mS/cm) o microsiemens (µS/cm).",
    content: `El agua pura desionizada no conduce la electricidad (EC = 0.0). Al disolver abonos minerales u orgánicos ionizables, las sales se disocian en aniones y cationes (NO3-, H2PO4-, K+, Ca2+, Mg2+), permitiendo el flujo de corriente.

¿Por qué es indispensable controlar la EC?
1. Previene el 'estrés osmótico' y sobrefertilización: Si la concentración de sales en el sustrato es mayor que dentro de las raíces, el agua saldrá de la planta hacia el sustrato por ósmosis ("quemadura de puntas" y deshidratación celular).
2. Asegura una alimentación progresiva: Las plántulas necesitan soluciones suaves (0.6 - 1.0 mS/cm), mientras que plantas en floración intensa toleran y demandan entre 1.6 y 2.0 mS/cm.

Rangos habituales según fase (base de agua de partida <0.4 mS/cm):
- Plántulas / esquejes: 0.6 – 0.9 mS/cm
- Crecimiento vegetativo medio: 1.1 – 1.4 mS/cm
- Floración temprana: 1.4 – 1.7 mS/cm
- Engorde floral pico: 1.8 – 2.1 mS/cm
- Lavado final: < 0.5 mS/cm

Diferencia entre EC y PPM:
Las partes por millón (PPM) son una conversión estimada de la EC. Como existen varias escalas (conversión 500 o 700 según el fabricante del medidor), la comunidad agronómica internacional prioriza siempre el valor directo en mS/cm o µS/cm para evitar confusiones.`,
    keyTakeaways: [
      "La EC refleja la cantidad total de alimento disuelto, no la proporción específica de cada elemento.",
      "Un aumento brusco de EC en el drenaje indica acumulación de sales no consumidas en el fondo de la maceta.",
      "Siempre es preferible sub-fertilizar ligeramente que sobre-fertilizar.",
    ],
    nextContentId: "amb_vpd_avanzado",
    nextContentTitle: "Déficit de Presión de Vapor (VPD): El motor de la transpiración",
    relatedArticleIds: ["riego_ph_basico", "sust_tierra_vs_coco", "nut_carencias_excesos"],
    sources: [ENCYCLOPEDIA_SOURCES.fao, ENCYCLOPEDIA_SOURCES.journal_horticulture],
    tags: ["ec", "electroconductividad", "sales", "fertilizantes", "nutricion"],
    readTimeMinutes: 6,
  },

  // 4. AMBIENTE / AVANZADO
  {
    id: "amb_vpd_avanzado",
    title: "Déficit de Presión de Vapor (VPD): Fisiología y Control Ambiental",
    slug: "vpd-deficit-presion-vapor",
    level: "Avanzado",
    levelDifficulty: "🔴 Avanzado",
    category: "ambiente",
    categoryLabel: "🌡️ Ambiente",
    categoryIcon: "🌡️",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "La relación matemática entre la temperatura foliar, la temperatura del aire y la humedad relativa que gobierna la apertura estomática.",
    definition: "El VPD (Vapour Pressure Deficit) es la diferencia entre la presión de vapor que el aire saturado ejercería dentro de la hoja a su temperatura y la presión de vapor real del aire que la rodea. Se mide en kilopascales (kPa).",
    content: `El VPD es la variable maestra que determina la tasa de transpiración y asimilación de agua y nutrientes a través del xilema vegetal.

1. VPD Demasiado Bajo (<0.4 kPa - Aire muy húmedo / frío):
El aire circundante está casi saturado. La planta no puede evaporar agua a través de los estomas. El transporte de calcio y boro hacia los brotes nuevos se detiene, provocando debilidad celular, deformaciones foliares y alta predisposición a hongos patógenos (Botrytis, Oídio).

2. VPD Demasiado Alto (>1.6 kPa en vegetativo / >1.8 kPa en floración - Aire muy seco / cálido):
El aire 'tira' del agua con excesiva fuerza. Para evitar deshidratarse, las hojas cierran parcialmente sus estomas, reduciendo la asimilación de CO2 y frenando la fotosíntesis. La planta absorbe más agua de la cuenta para no secarse, lo que puede inducir acumulación de sales en las puntas.

Rangos objetivo de VPD según etapa:
- Plántula y esquejes: 0.4 – 0.8 kPa (Humedad alta 70-80%, Temp 24-26°C)
- Vegetativo: 0.8 – 1.1 kPa (Humedad media 60-70%, Temp 23-26°C)
- Floración temprana a media: 1.0 – 1.3 kPa (Humedad 50-60%, Temp 22-25°C)
- Floración tardía: 1.2 – 1.5 kPa (Humedad 40-50%, Temp 21-24°C)

Temperatura de la hoja vs. Temperatura ambiental:
Bajo luces LED, la hoja suele estar 1°C a 2°C por debajo de la temperatura del aire debido a la ausencia de radiación infrarroja directa. Un sensor IR permite calcular el VPD foliar con máxima precisión.`,
    keyTakeaways: [
      "El VPD correlaciona temperatura y humedad en un solo indicador fisiológico clave.",
      "Mantener el VPD en rango óptimo maximiza la tasa fotosintética y el engorde sin riesgo de hongos.",
      "El control de extracción e intromisión de aire es la herramienta primaria para modular el VPD.",
    ],
    nextContentId: "nut_movilidad_nutrientes",
    nextContentTitle: "Movilidad de Nutrientes: Diagnóstico Visual Avanzado",
    relatedArticleIds: ["nut_ec_explicacion", "ilum_ppfd_dli", "plagas_prevencion_bioseguridad"],
    sources: [ENCYCLOPEDIA_SOURCES.journal_horticulture, ENCYCLOPEDIA_SOURCES.canadian_ag],
    tags: ["vpd", "humedad", "temperatura", "transpiracion", "estomas", "clima"],
    readTimeMinutes: 7,
  },

  // 5. SUSTRATOS / INTERMEDIO
  {
    id: "sust_tierra_vs_coco",
    title: "Tierra vs. Fibra de Coco: Diferencias Físicas y de Riego",
    slug: "diferencia-tierra-y-coco",
    level: "Intermedio",
    levelDifficulty: "🟡 Intermedio",
    category: "sustratos",
    categoryLabel: "🪴 Sustratos",
    categoryIcon: "🪴",
    stageRelation: ["Germinación", "Vegetativo", "Floración"],
    summary: "Comprende la retención de agua, capacidad de intercambio catiónico (CIC) y estrategias de fertirriego según el medio elegido.",
    definition: "La tierra es un medio vivo con materia orgánica y amortiguación biológica; la fibra de coco es un medio inerte con alta oxigenación que funciona como hidroponía pasiva.",
    content: `Elegir entre tierra y fibra de coco condiciona el método de riego, el pH de trabajo y el esquema de fertilización.

Comparativa directa:

1. Tierra / Sustratos orgánicos:
- Naturaleza: Contiene humus, turbas, perlita y nutrientes de liberación lenta.
- Capacidad de Buffer: Amortigua fluctuaciones de pH y excesos leves de sales gracias a su microbiología.
- Riego: Ciclos seco-húmedo (esperar a que el sustrato pierda el 50-60% de su peso antes de volver a regar).
- pH óptimo: 6.2 - 6.8.

2. Fibra de Coco:
- Naturaleza: Medio inerte y fibroso procedente del mesocarpio del coco, sin nutrientes propios iniciales.
- Oxigenación: Extraordinaria retención de aire (hasta 30% incluso estando saturado), lo que reduce drásticamente el riesgo de asfixia radicular.
- Riego: Tipo hidropónico (nunca dejar que se seque por completo, riegos frecuentes con fertilizante en cada pasada y 15-20% de drenaje).
- pH óptimo: 5.6 - 6.2.
- Manejo de Calcio/Magnesio: El coco tiene tendencia natural a fijar cationes de Ca y Mg liberando potasio y sodio; por ello requiere lavado/tamponado ("buffered") o aporte suplementario de Cal-Mag.`,
    keyTakeaways: [
      "En tierra se alternan riegos con fertilizante y riegos solo con agua.",
      "En coco se fertiliza en cada riego para mantener una EC constante y evitar que las sales se concentren.",
      "No mezclar protocolos de fertilización diseñados para tierra en cultivos de coco.",
    ],
    nextContentId: "bio_ciclo_vida",
    nextContentTitle: "Ciclo de Vida y Fases del Desarrollo Vegetal",
    relatedArticleIds: ["riego_ph_basico", "nut_ec_explicacion", "nut_npk_fundamentos"],
    sources: [ENCYCLOPEDIA_SOURCES.top_crop_tech, ENCYCLOPEDIA_SOURCES.fao],
    tags: ["sustrato", "tierra", "coco", "drenaje", "oxigeno", "macetas"],
    readTimeMinutes: 5,
  },

  // 6. ILUMINACIÓN / INTERMEDIO
  {
    id: "ilum_ppfd_dli",
    title: "Iluminación Técnica: PAR, PPFD y DLI Explicados",
    slug: "iluminacion-par-ppfd-dli",
    level: "Intermedio",
    levelDifficulty: "🟡 Intermedio",
    category: "iluminacion",
    categoryLabel: "💡 Iluminación",
    categoryIcon: "💡",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "Descubre cómo medir la luz útil que las plantas realmente utilizan para la fotosíntesis más allá de los vatios o lúmenes.",
    definition: "PPFD (Densidad de Flujo de Fotones Fotosintéticos) mide la cantidad de micromoles de fotones útiles (400-700nm) que inciden por metro cuadrado cada segundo (µmol/m²/s).",
    content: `Los lúmenes y lux miden la sensibilidad del ojo humano (centrada en el color verde), mientras que las plantas absorben fotones prioritariamente en las longitudes de onda azul (450nm) y roja (660nm).

Métricas profesionales de iluminación:

1. PAR (Radiación Fotosintéticamente Activa):
Rango del espectro lumínico entre 400nm y 700nm (y extendido hasta 730nm con infrarrojo cercano) que activa los centros de reacción de la clorofila A y B.

2. PPFD (µmol/m²/s):
Intensidad instantánea de fotones que llegan al dosel de la planta.
- Plántulas / esquejes: 150 – 250 µmol/m²/s
- Crecimiento vegetativo: 350 – 600 µmol/m²/s
- Floración sin CO2 añadido: 700 – 950 µmol/m²/s
- Floración con suplemento de CO2 (>1000 ppm): 1000 – 1400 µmol/m²/s

3. DLI (Daily Light Integral - Integral Diaria de Luz):
Mide la dosis total de luz acumulada en 24 horas (moles/m²/día).
Fórmula: DLI = PPFD × horas de luz × 0.0036
Ejemplo en floración: 800 µmol/m²/s × 12 horas × 0.0036 = 34.56 mol/m²/día (rango óptimo para máxima biosíntesis).`,
    keyTakeaways: [
      "El exceso de PPFD sin suficiente agua, nutrición y CO2 provoca foto-inhibición y blanqueamiento foliar.",
      "La distancia de la lámpara al dosel regula el PPFD y la disipación térmica.",
      "Los chips LED de espectro completo ofrecen mayor eficiencia cuántica (µmol/J) que las tecnologías de descarga tradicionales.",
    ],
    nextContentId: "amb_vpd_avanzado",
    nextContentTitle: "Déficit de Presión de Vapor (VPD)",
    relatedArticleIds: ["amb_vpd_avanzado", "bio_ciclo_vida", "desarrollo_podas_entrenamiento"],
    sources: [ENCYCLOPEDIA_SOURCES.canadian_ag, ENCYCLOPEDIA_SOURCES.journal_horticulture],
    tags: ["luz", "led", "ppfd", "dli", "par", "fotoperiodo", "espectro"],
    readTimeMinutes: 6,
  },

  // 7. DESARROLLO Y PODAS / INTERMEDIO
  {
    id: "desarrollo_podas_entrenamiento",
    title: "Técnicas de Entrenamiento: Poda Apical, FIM y LST",
    slug: "podas-entrenamiento-lst-apical",
    level: "Intermedio",
    levelDifficulty: "🟡 Intermedio",
    category: "desarrollo",
    categoryLabel: "🌿 Desarrollo vegetal",
    categoryIcon: "🌿",
    stageRelation: ["Vegetativo"],
    summary: "Guía paso a paso para optimizar la distribución de la canopia, romper la dominancia apical y multiplicar las colas principales.",
    definition: "El entrenamiento vegetal agrupa técnicas mecánicas (LST, SCROG) y de poda selectiva (Topping, FIM) para homogeneizar la recepción lumínica en todos los nudos.",
    content: `En su estado silvestre, las plantas crecen con forma de pino o árbol de navidad (dominancia apical guiada por auxinas). En cultivo interior, la luz proviene de un punto fijo cenital, por lo que las ramas bajas reciben mucha menos intensidad.

Principales técnicas:

1. LST (Low Stress Training - Guiado de bajo estrés):
- En qué consiste: Doblar y atar el tallo principal suavemente hacia los lados sin cortar ningún tejido.
- Ventaja: No genera estrés hormonal ni detiene el crecimiento. Distribuye las auxinas horizontalmente estimulando los brotes secundarios.
- Momento ideal: A partir del 3er o 4to nudo en vegetativo.

2. Poda Apical (Topping):
- En qué consiste: Cortar limpiamente el ápice principal justo por encima del 4to o 5to nudo con tijera esterilizada.
- Resultado: Las dos ramas secundarias del nudo inmediatamente inferior asumen el rol de ápices dominantes, duplicando las puntas principales.

3. Poda FIM ("Fuck I Missed"):
- En qué consiste: Cortar el 70-80% del brote apical nuevo en lugar del tallo completo.
- Resultado: Puede generar de 3 a 4 nuevos brotes principales con menor frenada vegetativa.

4. SCROG (Screen of Green):
- Uso de una malla horizontal a 20-30 cm de la base para ir guiando y entrelazando las ramas a medida que crecen, creando un plano de flores perfectamente uniforme.`,
    keyTakeaways: [
      "Esterilizar siempre las herramientas de corte con alcohol isopropílico para evitar infecciones fúngicas o víricas.",
      "Realizar podas y entrenamientos intensivos únicamente durante el crecimiento vegetativo, nunca en floración avanzada.",
      "En plantas autoflorecientes se desaconsejan podas agresivas debido a su breve ventana vegetativa fija.",
    ],
    nextContentId: "plagas_prevencion_bioseguridad",
    nextContentTitle: "Manejo Integrado de Plagas y Prevención",
    relatedArticleIds: ["bio_ciclo_vida", "ilum_ppfd_dli", "amb_vpd_avanzado"],
    sources: [ENCYCLOPEDIA_SOURCES.inta, ENCYCLOPEDIA_SOURCES.uc_davis],
    tags: ["podas", "apical", "lst", "scrog", "entrenamiento", "canopia"],
    readTimeMinutes: 6,
  },

  // 8. PLAGAS Y PROBLEMAS / PRINCIPIANTE
  {
    id: "plagas_prevencion_bioseguridad",
    title: "Manejo Integrado de Plagas: Detección Temprana y Prevención",
    slug: "manejo-plagas-prevencion",
    level: "Principiante",
    levelDifficulty: "🟢 Fácil",
    category: "plagas",
    categoryLabel: "🐛 Plagas y problemas",
    categoryIcon: "🐛",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "Aprende a identificar a tiempo trips, araña roja, mosca del sustrato y hongos foliares con estrategias preventivas y ecológicas.",
    definition: "El Manejo Integrado de Plagas (MIP) prioriza la prevención ambiental, la higiene y el control biológico por sobre la aplicación de químicos agresivos.",
    content: `En cultivo doméstico, la mejor defensa contra plagas es crear un ambiente donde los patógenos no puedan prosperar.

Principales plagas y signos tempranos:

1. Trips (Frankliniella occidentalis):
- Síntomas: Pequeñas manchas plateadas o brillantes en el haz de las hojas con puntitos negros (excrementos).
- Prevención/Control: Trampas cromotrópicas azules, jabón potásico y aceite de neem en vegetativo.

2. Araña Roja (Tetranychus urticae):
- Síntomas: Micro-punteaduras amarillas en las hojas. Con infestación avanzada, finas telarañas en las puntas.
- Factores que la favorecen: Climas cálidos (>27°C) y secos (humedad <40%).
- Control: Mantener humedad adecuada en vegetativo, depredadores naturales (Phytoseiulus persimilis).

3. Mosca del Sustrato (Sciaridae):
- Síntomas: Pequeños mosquitos negros revoloteando sobre la tierra. Las larvas en el sustrato dañan pelos radiculares.
- Control: Dejar secar la capa superficial del sustrato entre riegos, tierra de diatomeas, trampas amarillas y Bacillus thuringiensis israelensis.

Reglas de Bioseguridad:
- Nunca ingresar al espacio de cultivo con ropa o calzado de la calle o jardines exteriores.
- Colocar filtros de malla fina en los conductos de intracción de aire.
- Inspeccionar semanalmente el envés de las hojas con lupa de 30x a 60x.`,
    keyTakeaways: [
      "Prevenir es diez veces más fácil que erradicar una plaga establecida.",
      "Nunca aplicar pulverizaciones de ningún tipo sobre flores maduras para proteger la calidad del producto final.",
      "Las trampas cromotrópicas adhesivas sirven como sistema de alerta temprana.",
    ],
    nextContentId: "nut_movilidad_nutrientes",
    nextContentTitle: "Movilidad de Nutrientes y Carencias",
    relatedArticleIds: ["amb_vpd_avanzado", "bio_ciclo_vida", "desarrollo_podas_entrenamiento"],
    sources: [ENCYCLOPEDIA_SOURCES.inta, ENCYCLOPEDIA_SOURCES.fao],
    tags: ["plagas", "trips", "arañaroja", "neem", "bioseguridad", "hongos"],
    readTimeMinutes: 5,
  },

  // 9. NUTRICIÓN AVANZADA / AVANZADO
  {
    id: "nut_movilidad_nutrientes",
    title: "Movilidad de Nutrientes en la Planta: Clorosis Basal vs. Apical",
    slug: "movilidad-nutrientes-carencias",
    level: "Avanzado",
    levelDifficulty: "🔴 Avanzado",
    category: "nutricion",
    categoryLabel: "🧪 Nutrición",
    categoryIcon: "🧪",
    stageRelation: ["Vegetativo", "Floración"],
    summary: "Distingue elementos móviles de inmóviles para diagnosticar con precisión si una carencia es de Nitrógeno, Magnesio, Hierro o Calcio.",
    definition: "Los nutrientes móviles pueden ser reubicados por la planta desde tejidos viejos hacia brotes nuevos; los nutrientes inmóviles quedan fijados y no pueden translocarse.",
    content: `Cuando a una planta le falta un nutriente, su fisiología responde de manera predecible según la movilidad celular del elemento químico:

1. Nutrientes MÓVILES (Los síntomas aparecen primero en las HOJAS VIEJAS o BASALES):
La planta descompone moléculas de sus hojas inferiores para enviar el elemento escaso a las hojas superiores en crecimiento.
- Nitrógeno (N): Amarilleo uniforme y progresivo que comienza desde las hojas más bajas hacia arriba. Las hojas pierden vigor y caen.
- Fósforo (P): Hojas oscuras con tonalidades púrpuras/bronceadas, pecíolos rojos y desaceleración del ritmo de crecimiento.
- Potasio (K): Clorosis y quemaduras en los bordes y puntas de las hojas viejas ("efecto de borde quemado"), con enrollamiento hacia arriba.
- Magnesio (Mg): Clorosis interfoliar (el espacio entre los nervios se torna amarillo mientras los nervios principales permanecen verdes) en hojas medias y bajas.

2. Nutrientes INMÓVILES (Los síntomas aparecen primero en los BROTES NUEVOS o SUPERIORES):
La planta no puede mover el elemento ya fijado; los nuevos tejidos crecen sin él.
- Calcio (Ca): Manchas necróticas marrones circulares en brotes nuevos, hojas jóvenes con puntas deformadas o en forma de garra.
- Hierro (Fe): Intensa clorosis interfoliar en las hojas superiores más jóvenes (casi blancas/amarillas brillantes), mientras los nervios quedan verdes.
- Boro (B): Muerte de yemas terminales y fragilidad de tallos nuevos.

Principio de Liebig (Ley del Mínimo):
El rendimiento y desarrollo del cultivo están limitados por el nutriente esencial que se encuentra en menor proporción relativa, independientemente de la abundancia de todos los demás.`,
    keyTakeaways: [
      "Identificar si el síntoma está arriba o abajo en la planta reduce el diagnóstico a la mitad de las opciones posibles.",
      "La mayoría de las presuntas 'carencias' se deben en realidad a bloqueos de pH en el sustrato y no a falta de abono.",
      "Realizar un lavado de raíces suave o ajustar el pH es el primer paso antes de agregar más fertilizantes.",
    ],
    nextContentId: "curado_secado_optimo",
    nextContentTitle: "Secado y Curado: Ciencia de los Terpenos",
    relatedArticleIds: ["riego_ph_basico", "nut_ec_explicacion", "sust_tierra_vs_coco"],
    sources: [ENCYCLOPEDIA_SOURCES.fao, ENCYCLOPEDIA_SOURCES.uc_davis],
    tags: ["nutrientes", "carencias", "movilidad", "nitrogeno", "potasio", "calcio", "magnesio"],
    readTimeMinutes: 7,
  },

  // 10. COSECHA Y CURADO / PRINCIPIANTE
  {
    id: "curado_secado_optimo",
    title: "Secado y Curado: Preservación de Terpenos y Degradación de Clorofila",
    slug: "secado-curado-terpenos",
    level: "Principiante",
    levelDifficulty: "🟢 Fácil",
    category: "etapas",
    categoryLabel: "🌸 Etapas del cultivo",
    categoryIcon: "🌸",
    stageRelation: ["Secado", "Curado", "Cosechado"],
    summary: "Parámetros óptimos de humedad y temperatura para transformar la cosecha en flores aromáticas, suaves y de máxima conservación.",
    definition: "El secado y curado es el proceso postcosecha de deshidratación controlada y descomposición enzimática de azúcares y clorofila.",
    content: `Una cosecha excepcional puede arruinarse si el proceso de secado es demasiado rápido o si se produce condensación en los frascos.

1. Fase de Secado (10 a 16 días):
- Temperatura ideal: 18°C a 20°C (evitar superar los 21°C para no volatilizar monoterpenos como el mirceno y limoneno).
- Humedad relativa ideal: 55% a 62%.
- Ventilación: Circulación de aire indirecta (el ventilador nunca debe apuntar directamente a las flores colgadas).
- Oscuridad total: La luz UV degrada los cannabinoides y la resina.
- Prueba del tallo: El secado concluye cuando las ramas finas se quiebran con un 'chasquido' nítido en lugar de doblarse con elasticidad.

2. Fase de Curado en Frascos (2 a 8 semanas):
- Recipientes: Frascos de vidrio herméticos llenos hasta el 75% de su capacidad.
- Control de humedad: Mantener un mini higrómetro en el frasco buscando el rango de 58% a 62% HR (sobres reguladores de humedad tipo Boveda/Integra).
- 'Eructado' (Burping): Abrir los frascos 10-15 minutos diarios durante las dos primeras semanas para renovar oxígeno y evacuar la humedad residual interna.`,
    keyTakeaways: [
      "Un secado excesivamente rápido (menos de 7 días) encierra la clorofila, produciendo sabor a heno o césped cortado.",
      "La humedad por encima del 65% en frascos cerrados genera riesgo crítico de proliferación de Botrytis (moho gris).",
      "El curado paciente permite la conversión de precursores en perfiles organolépticos ricos y complejos.",
    ],
    nextContentId: "legislacion_seguridad_responsable",
    nextContentTitle: "Marco Normativo y Seguridad en Autocultivo",
    relatedArticleIds: ["bio_ciclo_vida", "amb_vpd_avanzado", "ilum_ppfd_dli"],
    sources: [ENCYCLOPEDIA_SOURCES.uc_davis, ENCYCLOPEDIA_SOURCES.canadian_ag],
    tags: ["cosecha", "secado", "curado", "terpenos", "clorofila", "frascos"],
    readTimeMinutes: 5,
  },

  // 11. LEGISLACIÓN Y SEGURIDAD / PRINCIPIANTE
  {
    id: "legislacion_seguridad_responsable",
    title: "Marco Normativo, Privacidad y Seguridad Eléctrica",
    slug: "seguridad-legislacion-autocultivo",
    level: "Principiante",
    levelDifficulty: "🟢 Fácil",
    category: "legislacion",
    categoryLabel: "📖 Legislación y seguridad",
    categoryIcon: "📖",
    stageRelation: ["Germinación", "Vegetativo", "Floración"],
    summary: "Pautas de responsabilidad legal, protección de datos personales y prevención de accidentes en instalaciones eléctricas.",
    definition: "Prácticas de seguridad doméstica y cumplimiento de las regulaciones locales sobre autocultivo medicinal o personal.",
    content: `Cultiva es una herramienta de uso estrictamente privado, educativo y de documentación personal.

1. Responsabilidad Normativa Local:
- Las leyes sobre autocultivo varían significativamente según el país y la jurisdicción (ej. registros REPROCANN en Argentina, clubes cannabicos en España, normativas estatales en EE.UU./Canadá, etc.).
- Es obligación de cada usuario conocer y actuar dentro del marco regulatorio legal aplicable en su localidad.
- La información técnica brindada en esta aplicación no constituye asesoramiento legal ni reemplaza prescripciones médicas o agronómicas habilitadas.

2. Seguridad Eléctrica en Interiores:
- Cargas eléctricas: Nunca sobrecargar zapatillas o tomas múltiples; calcular la potencia total consumida en vatios (W) y amperios (A).
- Agua y Electricidad: Mantener balastros, temporizadores y enchufes SIEMPRE elevados del suelo y lejos de bandejas de drenaje o fuentes de agua.
- Disyuntor diferencial: Contar con protección termomagnética y disyuntor en el cuadro eléctrico de la vivienda.

3. Privacidad y Seguridad Digital:
- En Cultiva, tus fotos y registros residen localmente en la base de datos de tu dispositivo.`,
    keyTakeaways: [
      "Verificar y mantener actualizada la documentación legal de tu cultivo personal.",
      "La seguridad eléctrica previene accidentes y cortocircuitos en espacios interiores.",
      "Cultiva no almacena tus datos biométricos en servidores públicos externos.",
    ],
    nextContentId: "bio_ciclo_vida",
    nextContentTitle: "Ciclo de Vida y Fases del Desarrollo Vegetal",
    relatedArticleIds: ["bio_ciclo_vida", "riego_ph_basico", "ilum_ppfd_dli"],
    sources: [ENCYCLOPEDIA_SOURCES.canadian_ag],
    tags: ["seguridad", "legislacion", "electricidad", "privacidad", "responsabilidad"],
    readTimeMinutes: 4,
  },
];
