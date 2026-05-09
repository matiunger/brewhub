export interface MashStepEntry {
  id: string;
  hora: string | null;
  tempC: number | null;
  ph: number | null;
  recirculado: boolean;
  revolver: boolean;
}

export interface FermentationStep {
  id: string;
  fechaHora: string | null;
  volumenL: number | null;
  densidadGL: number | null;
  ph: number | null;
  tempC: number | null;
  pressureBar: number | null;
  bubbleIntervalSec: number | null;
  notes: string | null;
}

export interface BoilEntry {
  id: string;
  hora: string | null;
  alturaCm: number | null;
  volumenL: number | null;
  volumenObjL: number | null;
}

export interface PreparacionData {
  congelarBotellas: boolean;
  armarMolino: boolean;
  lavarMacerador: boolean;
  lavarFermentador: boolean;
  pesarMaltas: boolean;
  prepararAnafe: boolean;
  cargaGarrafaKg: number | null;
  filtrarAgua: boolean;
  calibrarPhmetro: boolean;
  prepararHeladera: boolean;
  armarSerpentinas: boolean;
  prepararAlcohol: boolean;
  cocinaLimpia: boolean;
  prepararMesa: boolean;
}

export interface MoliendaData {
  fechaHora: string | null;
  gapMm: number | null;
}

export interface MaceradoData {
  aguaMacerado: {
    lts: number | null;
    alturaCm: number | null;
    potDiameterCm: number | null;
    olla: string | null;
    tStrikeC: number | null;
    notes: string | null;
  };
  aguaLavado: {
    lts: number | null;
    alturaCm: number | null;
    potDiameterCm: number | null;
    olla: string | null;
    tempC: number | null;
    ph: number | null;
    notes: string | null;
  };
  general: {
    checkGustoAgua: boolean;
    horaCalentarAgua: string | null;
    horaInicioEmpaste: string | null;
    horaInicioMacerado: string | null;
    tempObjetivoC: number | null;
    tempMashC: number | null;
    phMash: number | null;
  };
  timeline: MashStepEntry[];
}

export interface LavadoData {
  horaInicioRecirculado: string | null;
  horaFinRecirculado: string | null;
  horaInicioLavado: string | null;
  horaFinLavado: string | null;
  primerMostoDensidad: number | null;
  primerMostoPh: number | null;
}

export interface PreboilData {
  volumenObjL: number | null;
  alturaObjCm: number | null;
  densidadObjGL: number | null;
  volumenL: number | null;
  alturaCm: number | null;
  densidadGL: number | null;
  tempC: number | null;
  ph: number | null;
}

export interface LastRunData {
  densidadGL: number | null;
  ph: number | null;
}

export interface HervidoData {
  entries: BoilEntry[];
  irishMossCheck: boolean;
  irishMossGr: number | null;
  nutrientesCheck: boolean;
  nutrientesGr: number | null;
  evaporacionL: number | null;
}

export interface WhirlpoolEnfriadoData {
  horaInicioWhirlpool: string | null;
  horaInicioEnfriado: string | null;
  tempInicioC: number | null;
  horaFinEnfriado: string | null;
  tempFinC: number | null;
  horaFinTrasvase: string | null;
  tempTrasvaseC: number | null;
  muestraOg: boolean;
  muestraOgDensidad: number | null;
  muestraOgDensidadObj: number | null;
  muestraOgPh: number | null;
}

export interface FermentacionData {
  pesoTotalKg: number | null;
  pesoLiquidoKg: number | null;
  volumenL: number | null;
  pesoGarrafaFinalKg: number | null;
  steps: FermentationStep[];
}

export interface KegEntry {
  id: string;
  kegId: string;
  kegName: string;
  tareWeightKg: number | null;
  totalWeightKg: number | null;
}

export interface EmbarriladoData {
  gelatinaCheck: boolean;
  gelatinaText: string | null;
  smbCheck: boolean;
  smbText: string | null;
  fechaHora: string | null;
  volumenL: number | null;
  kegs: KegEntry[];
}

export interface BrewdayData {
  preparacion: PreparacionData;
  molienda: MoliendaData;
  macerado: MaceradoData;
  lavado: LavadoData;
  preboil: PreboilData;
  lastRun: LastRunData;
  hervido: HervidoData;
  whirlpoolEnfriado: WhirlpoolEnfriadoData;
  fermentacion: FermentacionData;
  embarrilado: EmbarriladoData;
}

export const DEFAULT_BREWDAY_DATA: BrewdayData = {
  preparacion: {
    congelarBotellas: false,
    armarMolino: false,
    lavarMacerador: false,
    lavarFermentador: false,
    pesarMaltas: false,
    prepararAnafe: false,
    cargaGarrafaKg: null,
    filtrarAgua: false,
    calibrarPhmetro: false,
    prepararHeladera: false,
    armarSerpentinas: false,
    prepararAlcohol: false,
    cocinaLimpia: false,
    prepararMesa: false,
  },
  molienda: { fechaHora: null, gapMm: null },
  macerado: {
    aguaMacerado: { lts: null, alturaCm: null, potDiameterCm: null, olla: null, tStrikeC: null, notes: null },
    aguaLavado: { lts: null, alturaCm: null, potDiameterCm: null, olla: null, tempC: null, ph: null, notes: null },
    general: { checkGustoAgua: false, horaCalentarAgua: null, horaInicioEmpaste: null, horaInicioMacerado: null, tempObjetivoC: null, tempMashC: null, phMash: null },
    timeline: [{ id: "initial", hora: null, tempC: null, ph: null, recirculado: false, revolver: false }],
  },
  lavado: { horaInicioRecirculado: null, horaFinRecirculado: null, horaInicioLavado: null, horaFinLavado: null, primerMostoDensidad: null, primerMostoPh: null },
  preboil: { volumenObjL: null, alturaObjCm: null, densidadObjGL: null, volumenL: null, alturaCm: null, densidadGL: null, tempC: null, ph: null },
  lastRun: { densidadGL: null, ph: null },
  hervido: { entries: [], irishMossCheck: false, irishMossGr: null, nutrientesCheck: false, nutrientesGr: null, evaporacionL: null },
  whirlpoolEnfriado: { horaInicioWhirlpool: null, horaInicioEnfriado: null, tempInicioC: null, horaFinEnfriado: null, tempFinC: null, horaFinTrasvase: null, tempTrasvaseC: null, muestraOg: false, muestraOgDensidad: null, muestraOgDensidadObj: null, muestraOgPh: null },
  fermentacion: { pesoTotalKg: null, pesoLiquidoKg: null, volumenL: null, pesoGarrafaFinalKg: null, steps: [{ id: "pitching", fechaHora: null, volumenL: null, densidadGL: null, ph: null, tempC: null, pressureBar: null, bubbleIntervalSec: null, notes: null }] },
  embarrilado: { gelatinaCheck: false, gelatinaText: null, smbCheck: false, smbText: null, fechaHora: null, volumenL: null, kegs: [] },
};

export function parseBrewdayData(raw: string | null): BrewdayData {
  if (!raw) return DEFAULT_BREWDAY_DATA;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BREWDAY_DATA,
      ...parsed,
      preparacion: { ...DEFAULT_BREWDAY_DATA.preparacion, ...parsed.preparacion },
      molienda: { ...DEFAULT_BREWDAY_DATA.molienda, ...parsed.molienda },
      macerado: {
        ...DEFAULT_BREWDAY_DATA.macerado,
        ...parsed.macerado,
        aguaMacerado: { ...DEFAULT_BREWDAY_DATA.macerado.aguaMacerado, ...parsed.macerado?.aguaMacerado },
        aguaLavado: { ...DEFAULT_BREWDAY_DATA.macerado.aguaLavado, ...parsed.macerado?.aguaLavado },
        general: { ...DEFAULT_BREWDAY_DATA.macerado.general, ...parsed.macerado?.general },
        timeline: Array.isArray(parsed.macerado?.timeline) && parsed.macerado.timeline.length > 0
          ? parsed.macerado.timeline.map((e: Record<string, unknown>) => ({
              id: (e.id as string) ?? crypto.randomUUID(),
              hora: (e.hora as string | null) ?? null,
              tempC: (e.tempC as number | null) ?? null,
              ph: (e.ph as number | null) ?? null,
              recirculado: (e.recirculado as boolean) ?? false,
              revolver: (e.revolver as boolean) ?? false,
            }))
          : DEFAULT_BREWDAY_DATA.macerado.timeline,
      },
      lavado: { ...DEFAULT_BREWDAY_DATA.lavado, ...parsed.lavado },
      preboil: { ...DEFAULT_BREWDAY_DATA.preboil, ...parsed.preboil },
      lastRun: { ...DEFAULT_BREWDAY_DATA.lastRun, ...parsed.lastRun },
      hervido: { ...DEFAULT_BREWDAY_DATA.hervido, ...parsed.hervido },
      whirlpoolEnfriado: { ...DEFAULT_BREWDAY_DATA.whirlpoolEnfriado, ...parsed.whirlpoolEnfriado },
      fermentacion: {
        ...DEFAULT_BREWDAY_DATA.fermentacion,
        ...parsed.fermentacion,
        steps: Array.isArray(parsed.fermentacion?.steps) && parsed.fermentacion.steps.length > 0
          ? parsed.fermentacion.steps.map((s: Record<string, unknown>) => ({
              id: (s.id as string) ?? crypto.randomUUID(),
              fechaHora: (s.fechaHora as string | null) ?? null,
              volumenL: (s.volumenL as number | null) ?? null,
              densidadGL: (s.densidadGL as number | null) ?? null,
              ph: (s.ph as number | null) ?? null,
              tempC: (s.tempC as number | null) ?? null,
              pressureBar: (s.pressureBar as number | null) ?? null,
              bubbleIntervalSec: (s.bubbleIntervalSec as number | null) ?? null,
              notes: (s.notes as string | null) ?? null,
            }))
          : DEFAULT_BREWDAY_DATA.fermentacion.steps,
      },
      embarrilado: { ...DEFAULT_BREWDAY_DATA.embarrilado, ...parsed.embarrilado, kegs: parsed.embarrilado?.kegs ?? [] },
    };
  } catch {
    return DEFAULT_BREWDAY_DATA;
  }
}
