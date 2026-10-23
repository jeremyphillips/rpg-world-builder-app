import { createElement } from 'react'
import { GENERAL_TABLE_KIND_ENTRIES, PROGRESSION_TABLE_KIND_ENTRIES } from '@rpg/contracts'
import { Icon, type IconName, type RadioCardOption } from '@rpg/ui'

import { TABLE_BUILDER_KIND_CARD_DESCRIPTIONS } from './table-builder-copy'
import type { TableBuilderKind } from './table-builder-kind'

export const TABLE_BUILDER_KIND_ICONS = {
  levelProgression: 'chart-no-axes-column',
  general: 'grid-3x3',
} as const satisfies Record<TableBuilderKind, IconName>

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
  return orderedKinds.map((kind) => ({
    value: kind,
    label: tableBuilderKindLabel(kind),
    description: TABLE_BUILDER_KIND_CARD_DESCRIPTIONS[kind],
    icon: createElement(Icon, {
      name: TABLE_BUILDER_KIND_ICONS[kind],
      size: 'lg',
    }),
  }))
}
