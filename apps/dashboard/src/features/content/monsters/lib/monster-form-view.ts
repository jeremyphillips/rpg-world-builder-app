export const MONSTER_FORM_TAB = {
  identity: 'identity',
  statistics: 'statistics',
  creatureDetails: 'creatureDetails',
  equipment: 'equipment',
  traits: 'traits',
  actions: 'actions',
} as const

const TAB_BY_PREFIX: Record<string, string> = {
  name: MONSTER_FORM_TAB.identity,
  description: MONSTER_FORM_TAB.identity,
  size: MONSTER_FORM_TAB.identity,
  creatureType: MONSTER_FORM_TAB.identity,
  alignment: MONSTER_FORM_TAB.identity,
  media: MONSTER_FORM_TAB.identity,
  abilityScores: MONSTER_FORM_TAB.statistics,
  savingThrows: MONSTER_FORM_TAB.statistics,
  armorClass: MONSTER_FORM_TAB.statistics,
  hitPoints: MONSTER_FORM_TAB.statistics,
  movement: MONSTER_FORM_TAB.statistics,
  hover: MONSTER_FORM_TAB.statistics,
  challengeRating: MONSTER_FORM_TAB.statistics,
  experiencePointsOverride: MONSTER_FORM_TAB.statistics,
  proficiencies: MONSTER_FORM_TAB.creatureDetails,
  senses: MONSTER_FORM_TAB.creatureDetails,
  languages: MONSTER_FORM_TAB.creatureDetails,
  defenses: MONSTER_FORM_TAB.creatureDetails,
  equipment: MONSTER_FORM_TAB.equipment,
  traits: MONSTER_FORM_TAB.traits,
  actions: MONSTER_FORM_TAB.actions,
  bonusActions: MONSTER_FORM_TAB.actions,
  reactions: MONSTER_FORM_TAB.actions,
}

/** Maps a body issue path to a monster form tab. Saving throws stay on Statistics. */
export function resolveMonsterFormViewForPath(path: string): string {
  if (path === 'proficiencies.savingThrows' || path.startsWith('proficiencies.savingThrows.')) {
    return MONSTER_FORM_TAB.statistics
  }
  const key = path.split('.')[0] ?? MONSTER_FORM_TAB.identity
  return TAB_BY_PREFIX[key] ?? MONSTER_FORM_TAB.identity
}
