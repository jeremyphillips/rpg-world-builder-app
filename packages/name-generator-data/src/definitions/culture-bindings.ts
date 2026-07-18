import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { elvenPersonalDefinition } from './elven/personal'
import { elvenSettlementDefinition } from './elven/settlement'

export const CULTURE_CONVENTION_BINDINGS = {
  elven: [elvenPersonalDefinition, elvenSettlementDefinition],
} as const satisfies Record<string, readonly NamingConventionDefinition[]>
