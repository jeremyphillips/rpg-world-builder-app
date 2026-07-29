import { getProficiencyDomainCompactLabel } from '@rpg/contracts'

export const CHARACTER_STAT_LABELS = {
  armorClass: 'AC',
  initiative: 'Initiative',
  speed: 'Speed',
  proficiency: 'Proficiency',
  proficiencyBonusFooter: 'Bonus',
  hitPoints: 'Hit points',
  experience: 'XP',
} as const

export const CHARACTER_SECTION_LABELS = {
  abilities: 'Abilities',
  actions: 'Actions',
  savingThrows: 'Saving throws',
  proficiencies: 'Proficiencies',
  spells: 'Spells',
  equipment: 'Equipment',
  wealth: 'Wealth',
  classFeatures: 'Class features',
  speciesTraits: 'Species traits',
  feats: 'Feats',
  connections: 'Connections',
  narrative: 'Narrative',
} as const

export const CHARACTER_EMPTY_SECTION_TEXT = {
  actions: 'No weapon attacks to show.',
  savingThrows: 'No proficient saving throws.',
  proficiencies: 'No proficiencies recorded.',
  spells: 'No spells known.',
  equipment: 'No equipment carried.',
  classFeatures: 'No class features at this level.',
  speciesTraits: 'No species traits.',
  feats: 'No feats.',
  featuresAndTraits: 'No features, traits, or feats.',
  connections: 'No organization connections.',
  narrative: 'No narrative details recorded.',
} as const

export const CHARACTER_HIT_POINT_LABELS = {
  current: 'Current',
  max: 'Max',
  temporary: 'Temp',
} as const

export const CHARACTER_DETAIL_TAB_LABELS = {
  spells: 'Spells',
  equipment: 'Equipment',
  featuresAndTraits: 'Features & Traits',
  connections: 'Connections',
  narrative: 'Narrative',
} as const

export const CHARACTER_CARD_CAMPAIGN_LABEL = 'Campaign'
export const UNAVAILABLE_ORGANIZATION_LABEL = 'Unavailable organization'

export const CHARACTER_PROFICIENCY_GROUP_LABELS = {
  skills: getProficiencyDomainCompactLabel('skill'),
  languages: 'Languages',
  weapons: 'Weapons',
  tools: 'Tools',
  armor: 'Armor Training',
} as const
