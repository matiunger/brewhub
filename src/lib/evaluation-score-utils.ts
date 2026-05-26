import { formData } from './evaluation-form-data';
import type { EvaluationState } from './evaluation-types';

export function getScoreLabel(total: number): { text: string; description: string } {
  const entry = formData.scoring_guide.find(
    (g) => total >= g.min && total <= g.max
  );
  return entry
    ? { text: entry.text, description: entry.description }
    : { text: 'N/A', description: '' };
}

export function getTotalScore(state: EvaluationState): number {
  return Object.values(state.sections).reduce((sum, s) => {
    if (s.subScores) return sum + Object.values(s.subScores).reduce((a, b) => a + b, 0);
    return sum + (s.score || 0);
  }, 0);
}

export function getSectionMaxPoints(sectionId: string): number {
  const section = formData.sections.find((s) => s.id === sectionId);
  return section?.max_points ?? 0;
}

export function buildInitialState(settings: EvaluationState['settings']): EvaluationState {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const sections: EvaluationState['sections'] = {};
  for (const section of formData.sections) {
    const aspects: Record<string, { intensity?: string; descriptors?: string[]; option?: string }> = {};
    for (const aspect of section.aspects) {
      aspects[aspect.id] = {};
    }
    const subScores = section.sub_scores
      ? Object.fromEntries(section.sub_scores.map((s) => [s.id, 0]))
      : undefined;
    const subNotes = section.sub_scores
      ? Object.fromEntries(section.sub_scores.map((s) => [s.id, '']))
      : undefined;
    sections[section.id] = { score: 0, ...(subScores ? { subScores } : {}), notes: '', ...(subNotes ? { subNotes } : {}), flawed: false, aspects };
  }
  return {
    settings,
    header: {
      date: today,
      taster: '',
      name: '',
      brewery: '',
      style: settings.styleId ?? '',
      presentation: '',
      age: '',
      og: '',
      fg: '',
      ibu: '',
      srm: '',
      abv: '',
      comments: '',
      photoId: '',
    },
    sections,
  };
}
