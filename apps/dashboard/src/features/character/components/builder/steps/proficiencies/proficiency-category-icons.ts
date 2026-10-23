import { contentIdentityIcon, type IconName } from '@rpg/ui'

import type { ProficiencyStepSectionKind } from '@rpg/contracts'

export const proficiencyCategoryIcons = {
  savingThrows: 'badge-check',
  skills: contentIdentityIcon('skill-proficiency'),
  weapons: 'swords',
  armor: 'shield',
  tools: 'wrench',
  languages: 'languages',
} satisfies Record<ProficiencyStepSectionKind, IconName>
