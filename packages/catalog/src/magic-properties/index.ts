import { z } from 'zod'
import {
  magicPropertyDefinitionSchema,
  type MagicPropertyDefinition,
  type SystemRulesetId,
} from '@rpg/contracts'

import magicPropertiesRaw from './data/srd-cc-5.2.1/magic-properties.json'

const magicPropertyArraySchema = z.array(magicPropertyDefinitionSchema)

const SRD_521_MAGIC_PROPERTIES = magicPropertyArraySchema.parse(magicPropertiesRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_MAGIC_PROPERTIES,
} as const satisfies Record<SystemRulesetId, MagicPropertyDefinition[]>

export function loadSeedMagicProperties(rulesetId: SystemRulesetId): MagicPropertyDefinition[] {
  return [...SEED_BY_RULESET[rulesetId]]
}

export function createMagicPropertyDefinitionProvider(rulesetId: SystemRulesetId) {
  const byId = new Map(loadSeedMagicProperties(rulesetId).map((row) => [row.id, row]))
  return (id: string) => byId.get(id)
}
