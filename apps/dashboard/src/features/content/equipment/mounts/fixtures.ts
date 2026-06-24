import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { MountEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const RIDING_HORSE = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is MountEquipment => item.slug === 'riding-horse',
)!

export const MULE = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is MountEquipment => item.slug === 'mule',
)!

export const MOUNT_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is MountEquipment => item.kind === 'mount',
)
