export const STANDARD_ARRAY_EMPTY_SCORE_VALUE = '__empty__'

export const abilitiesFormCopy = {
  standardArrayHeading: 'Standard Array',
  standardArrayDescription: 'Assign each score to one ability.',
  availableScores: 'Available Scores',
  abilityScores: 'Ability Scores',
  columnAbility: 'Ability',
  columnScore: 'Score',
  columnModifier: 'Modifier',
  emptyScore: '—',
  scoresRemaining: (count: number) =>
    count === 0 ? 'All scores assigned' : `${count} ${count === 1 ? 'score' : 'scores'} remaining`,
  assignedTo: (score: number, abilityAbbreviation: string) =>
    `${score} — assigned to ${abilityAbbreviation}`,
} as const
