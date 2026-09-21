import type { BuilderFactSummaryIconKey } from '@rpg/contracts'
import { Crosshair, ShieldCheck, WandSparkles, type LucideIcon } from 'lucide-react'

export const spellcastingFactSummaryRowIcons = {
  'spellcasting-ability': WandSparkles,
  'spell-save-dc': ShieldCheck,
  'spell-attack': Crosshair,
} satisfies Record<BuilderFactSummaryIconKey, LucideIcon>
