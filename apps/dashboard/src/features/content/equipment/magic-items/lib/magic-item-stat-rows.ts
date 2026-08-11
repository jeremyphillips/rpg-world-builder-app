import {
  getMagicItemCategoryLabel,
  getMagicItemRarityLabel,
  getVocabularyTermLabel,
  MAGIC_ITEM_RARITY_TERM,
  type MagicItemEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'

/** Stat rows for magic item equipment detail (excludes kind and cost). */
export function getMagicItemStatRows(item: MagicItemEquipment): ContentStatRowData[] {
  return [
    ...(item.rarity
      ? [
          {
            label: getVocabularyTermLabel(MAGIC_ITEM_RARITY_TERM),
            value: getMagicItemRarityLabel(item.rarity),
          },
        ]
      : []),
    ...(item.requiresAttunement !== undefined
      ? [{ label: 'Attunement', value: item.requiresAttunement ? 'Required' : 'None' }]
      : []),
    ...(item.attunementRequirement
      ? [{ label: 'Attunement requirement', value: item.attunementRequirement }]
      : []),
    ...(item.magicItemCategory
      ? [{ label: 'Category', value: getMagicItemCategoryLabel(item.magicItemCategory) }]
      : []),
  ]
}
