import type { ArmorClassBase, ArmorClassMode } from '@rpg/contracts'

export const ARMOR_CLASS_MODE_LABELS: Record<ArmorClassMode, string> = {
  ascending: 'Ascending',
  descending: 'Descending',
}

export const ARMOR_CLASS_BASE_LABELS: Record<ArmorClassBase, string> = {
  9: 'Base 9 (unarmored)',
  10: 'Base 10 (unarmored)',
}
