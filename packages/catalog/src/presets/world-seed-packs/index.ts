import { worldSeedPackSchema, type WorldSeedPack } from '@rpg/contracts'
import { z } from 'zod'

import packsRaw from './data/world-seed-packs.json'

const WORLD_SEED_PACKS = z.array(worldSeedPackSchema).parse(packsRaw)

/** Descriptor-only registry until the first seeded world content type lands. */
export function loadWorldSeedPacks(): WorldSeedPack[] {
  return WORLD_SEED_PACKS
}

export function getWorldSeedPackById(id: string): WorldSeedPack {
  const pack = WORLD_SEED_PACKS.find((entry) => entry.metadata.id === id)

  if (!pack) {
    throw new Error(`World seed pack not found: ${id}`)
  }

  return pack
}
