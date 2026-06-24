import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { WeaponEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const LONGSWORD = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is WeaponEquipment => item.slug === 'longsword',
)!

export const SHORTBOW = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is WeaponEquipment => item.slug === 'shortbow',
)!

export const DAGGER = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is WeaponEquipment => item.slug === 'dagger',
)!

export const WEAPON_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is WeaponEquipment => item.kind === 'weapon',
)
