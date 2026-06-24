import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { MagicItemEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const BRACERS_OF_DEFENSE = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is MagicItemEquipment => item.slug === 'bracers-of-defense',
)!

export const MAGIC_ITEM_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is MagicItemEquipment => item.kind === 'magic_item',
)
