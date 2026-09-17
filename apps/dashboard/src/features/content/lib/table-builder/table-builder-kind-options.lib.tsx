import { createElement } from 'react'
import { GENERAL_TABLE_KIND_ENTRIES, PROGRESSION_TABLE_KIND_ENTRIES } from '@rpg/contracts'
import { ChartNoAxesColumn, Grid3x3, type LucideIcon } from 'lucide-react'
import type { RadioCardOption } from '@rpg/ui'

import { TABLE_BUILDER_KIND_CARD_DESCRIPTIONS } from './table-builder-copy'
import type { TableBuilderKind } from './table-builder-kind'

export const TABLE_BUILDER_KIND_ICONS: Record<TableBuilderKind, LucideIcon> = {
  levelProgression: ChartNoAxesColumn,
  general: Grid3x3,
}

const CONTRACT_KIND_LABELS: Record<TableBuilderKind, string> = {
  levelProgression: PROGRESSION_TABLE_KIND_ENTRIES.levelProgression.label,
  general: GENERAL_TABLE_KIND_ENTRIES.general.label,
}

export function tableBuilderKindLabel(kind: TableBuilderKind): string {
  return CONTRACT_KIND_LABELS[kind]
}

export function buildTableBuilderKindRadioOptions(
  orderedKinds: readonly TableBuilderKind[],
): RadioCardOption[] {
  return orderedKinds.map((kind) => {
    const Icon = TABLE_BUILDER_KIND_ICONS[kind]
    return {
      value: kind,
      label: tableBuilderKindLabel(kind),
      description: TABLE_BUILDER_KIND_CARD_DESCRIPTIONS[kind],
      icon: createElement(Icon, { className: 'size-4', 'aria-hidden': true }),
    }
  })
}
