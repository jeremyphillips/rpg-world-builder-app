import { loadSeedEquipment } from '@rpg/catalog/equipment'
import type { ServiceEquipment } from '@rpg/contracts'

import { STORY_RULESET_ID } from '../../lib/fixtures/constants'

export const SKILLED_HIRELING = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ServiceEquipment => item.slug === 'skilled-hireling',
)!

export const STABLING = loadSeedEquipment(STORY_RULESET_ID).find(
  (item): item is ServiceEquipment => item.slug === 'stabling',
)!

export const SERVICE_LIST = loadSeedEquipment(STORY_RULESET_ID).filter(
  (item): item is ServiceEquipment => item.kind === 'service',
)
