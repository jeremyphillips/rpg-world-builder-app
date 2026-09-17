import { Dices, Hash, Type, type LucideIcon } from 'lucide-react'
import {
  TABLE_COLUMN_VALUE_TYPES,
  TABLE_COLUMN_VALUE_TYPE_ENTRIES,
  type TableColumnValueType,
} from '@rpg/contracts'

/** Lucide icon per column value type — shared by the type select trigger and items. */
export const TABLE_COLUMN_VALUE_TYPE_ICONS: Record<TableColumnValueType, LucideIcon> = {
  number: Hash,
  dice: Dices,
  text: Type,
}

export const TABLE_COLUMN_VALUE_TYPE_OPTIONS = TABLE_COLUMN_VALUE_TYPES.map((valueType) => ({
  value: valueType,
  label: TABLE_COLUMN_VALUE_TYPE_ENTRIES[valueType].label,
  icon: TABLE_COLUMN_VALUE_TYPE_ICONS[valueType],
}))
