export const FIXED_SCORES_EMPTY_SCORE_VALUE = '__empty__'

/** @deprecated Use FIXED_SCORES_EMPTY_SCORE_VALUE */
export const STANDARD_ARRAY_EMPTY_SCORE_VALUE = FIXED_SCORES_EMPTY_SCORE_VALUE

export const abilitiesFormCopy = {
  availableScores: 'Available scores',
  dropScoreHere: 'Drop score here',
  chooseScore: 'Choose score',
  emptyScore: '—',
  emptyModifier: '—',
  scoresRemaining: (count: number) =>
    count === 0 ? 'All scores assigned' : `${count} ${count === 1 ? 'score' : 'scores'} remaining`,
  assignedTo: (score: number, abilityAbbreviation: string) =>
    `${score} — assigned to ${abilityAbbreviation}`,
} as const
