import type { BuilderFactSummaryIconKey } from '@rpg/contracts'
import type { IconName } from '@rpg/ui'

export const spellcastingFactSummaryRowIcons = {
  'spellcasting-ability': 'wand-sparkles',
  'spell-save-dc': 'shield-check',
  'spell-attack': 'crosshair',
} satisfies Record<BuilderFactSummaryIconKey, IconName>
