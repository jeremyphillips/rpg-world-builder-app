import { formatMovementDisplay } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import {
  CREATURE_FLY_HOVER_LABEL,
  MOVEMENT_FIELD_LABEL,
  movementArrayField,
  movementRecordToRows,
  movementRowsIncludeFly,
  movementRowsToRecordForPreview,
  type MovementRowDraftFormValues,
} from '../../../lib/forms/fields/content-movement-form-fields'
import {
  MONSTER_FORM_MOVEMENT_HINT,
  MONSTER_FORM_USE_BASE_MOVEMENT_LABEL,
} from '../monster-form-labels'

const FORM_BASE_MOVEMENT_DEPENDS = ['../../movement', '../../hover'] as const

function readBaseMovementRows(values: Record<string, unknown>): MovementRowDraftFormValues[] {
  const baseRows = (values['../../movement'] ?? values.movement) as
    | MovementRowDraftFormValues[]
    | undefined
  return baseRows ?? []
}

function readBaseHover(values: Record<string, unknown>): boolean {
  const hover = values['../../hover'] ?? values.hover
  return hover === true
}

function seedFormMovementOverride(values: Record<string, unknown>) {
  const record = movementRowsToRecordForPreview(readBaseMovementRows(values))
  return {
    rows: movementRecordToRows(record),
    ...(readBaseHover(values) && record.fly !== undefined ? { hover: true as const } : {}),
  }
}

function movementOverrideRowsField() {
  return {
    ...movementArrayField(),
    name: 'rows',
    heading: { label: MOVEMENT_FIELD_LABEL, labelVisibility: 'srOnly' as const },
    addAction: { label: 'Add movement', layout: 'stacked' as const, size: 'sm' as const },
    min: 0,
  }
}

function movementOverrideHoverField(): FormItem {
  return {
    type: 'switch',
    name: 'hover',
    label: CREATURE_FLY_HOVER_LABEL,
    visibility: {
      dependsOn: ['movementOverride'],
      visibleWhen: (watched) => {
        const rows = (
          watched.movementOverride as { rows?: MovementRowDraftFormValues[] } | undefined
        )?.rows
        return movementRowsIncludeFly(rows)
      },
    },
  }
}

/** Optional movement override for a defined alternate form row (master-detail relative paths). */
export function monsterFormMovementOverrideGroup(): FormItem {
  return {
    kind: 'group',
    name: 'movementOverride',
    heading: { label: MOVEMENT_FIELD_LABEL },
    headingScale: 'field',
    optionalDisclosure: {
      addLabel: MONSTER_FORM_MOVEMENT_HINT,
      removeLabel: MONSTER_FORM_USE_BASE_MOVEMENT_LABEL,
      expandWhenPopulated: true,
      labeled: true,
      watchPaths: ['movementOverride', 'overrides.movement'],
      clearPaths: ['movementOverride', 'overrides.movement'],
      seedWhen: (values) => seedFormMovementOverride(values),
      summary: {
        dependsOn: [...FORM_BASE_MOVEMENT_DEPENDS],
        resolve: (values) => {
          const record = movementRowsToRecordForPreview(readBaseMovementRows(values))
          const label = formatMovementDisplay(record, 'ft.')
          return label ? `Inherits: ${label}` : 'Inherits base movement.'
        },
      },
    },
    fields: [movementOverrideRowsField(), movementOverrideHoverField()],
  }
}
