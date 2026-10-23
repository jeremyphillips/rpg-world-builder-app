import {
  TABLE_COLUMN_VALUE_TYPES,
  TABLE_COLUMN_VALUE_TYPE_ENTRIES,
  type TableColumnValueType,
} from '@rpg/contracts'
import type { IconName } from '@rpg/ui'

/** Glyph per column value type — shared by the type select trigger and items. */
export const TABLE_COLUMN_VALUE_TYPE_ICONS = {
  number: 'hash',
  dice: 'dices',
  text: 'type',
} as const satisfies Record<TableColumnValueType, IconName>

export const TABLE_COLUMN_VALUE_TYPE_OPTIONS = TABLE_COLUMN_VALUE_TYPES.map((valueType) => ({
  value: valueType,
  label: TABLE_COLUMN_VALUE_TYPE_ENTRIES[valueType].label,
  icon: TABLE_COLUMN_VALUE_TYPE_ICONS[valueType],
}))
