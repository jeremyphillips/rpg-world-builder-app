import {
  BadgeCheck,
  Languages,
  ListChecks,
  Shield,
  Swords,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type { ProficiencyStepSectionKind } from '@rpg/contracts'

export const proficiencyCategoryIcons = {
  savingThrows: BadgeCheck,
  skills: ListChecks,
  weapons: Swords,
  armor: Shield,
  tools: Wrench,
  languages: Languages,
} satisfies Record<ProficiencyStepSectionKind, LucideIcon>
