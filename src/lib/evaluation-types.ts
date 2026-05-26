export interface IntensityOption {
  id: string;
  label: string;
}

export interface Descriptor {
  id: string;
  name: string;
  sections: string[];
  hint?: string;
}

export interface ScoringGuideEntry {
  min: number;
  max: number;
  text: string;
  description: string;
}

export interface HeaderField {
  id: string;
  label: string;
  type: string;
  default?: string;
  options?: string[];
}

export interface SRMOption {
  srm_min: number;
  srm_max: number;
  label: string;
  hex: string;
}

export interface SectionSubScore {
  id: string;
  label: string;
  max_points: number;
}

export interface Aspect {
  id: string;
  label: string;
  type?: string;
  intensity_scale?: boolean;
  descriptors?: string[];
  options?: string[] | SRMOption[];
  tasting_hint?: string;
  quick?: boolean;
  quick_descriptors_from?: string[];
}

export interface Section {
  id: string;
  label: string;
  phase: string;
  max_points: number;
  sub_scores?: SectionSubScore[];
  tasting_hints: string[];
  aspects: Aspect[];
}

export interface TastingProcedureStep {
  title: string;
  hint: string;
}

export interface EvaluationFormData {
  version: string;
  total_points: number;
  intensity_scale: IntensityOption[];
  descriptors: Descriptor[];
  scoring_guide: ScoringGuideEntry[];
  header: { fields: HeaderField[] };
  tasting_procedure: { label: string; steps: TastingProcedureStep[] };
  sections: Section[];
}

export interface BeerStyle {
  name: string;
  number: string;
  category: string;
  categorynumber: string;
  source?: 'bjcp' | 'ba';
  overallimpression: string;
  aroma: string;
  appearance: string;
  flavor: string;
  mouthfeel: string;
  comments?: string;
  history?: string;
  characteristicingredients?: string;
  stylecomparison?: string;
  ibumin?: string;
  ibumax?: string;
  ogmin?: string;
  ogmax?: string;
  fgmin?: string;
  fgmax?: string;
  abvmin?: string;
  abvmax?: string;
  srmmin?: string;
  srmmax?: string;
  commercialexamples?: string;
  tags?: string;
}

export interface AspectState {
  intensity?: string;
  descriptors?: string[];
  option?: string;
  inappropriate?: boolean;
}

export interface SectionState {
  score: number;
  subScores?: Record<string, number>;
  notes: string;
  subNotes?: Record<string, string>;
  flawed: boolean;
  aspects: Record<string, AspectState>;
}

export interface EvaluationSettings {
  mode: 'libre' | 'contra_estilo';
  speed: 'notes_only' | 'extended';
  hints: boolean;
  styleId: string | null;
}

export interface HeaderState {
  date: string;
  taster: string;
  name: string;
  brewery: string;
  style: string;
  presentation: string;
  age: string;
  og: string;
  fg: string;
  ibu: string;
  srm: string;
  abv: string;
  comments: string;
  photoId: string;
}

export interface EvaluationState {
  settings: EvaluationSettings;
  header: HeaderState;
  sections: Record<string, SectionState>;
}
