import { BadgeCheck, Languages, Shield, Swords, Wrench } from 'lucide-react'
import { contentIdentityIcon, type AppIcon } from '@rpg/ui'

import type { ProficiencyStepSectionKind } from '@rpg/contracts'

export const proficiencyCategoryIcons = {
  savingThrows: BadgeCheck,
  skills: contentIdentityIcon('skill-proficiency'),
  weapons: Swords,
  armor: Shield,
  tools: Wrench,
  languages: Languages,
} satisfies Record<ProficiencyStepSectionKind, AppIcon>
