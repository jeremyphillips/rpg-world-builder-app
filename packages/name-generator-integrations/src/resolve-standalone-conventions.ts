import type {
  NamingConvention,
  NamingConventionDefinition,
  NamingCultureContext,
} from '@rpg/contracts/name-generator'
import type { NamingCulture } from '@rpg/contracts/name-generator'

import { resolveNamingConvention } from './resolve-naming-convention'

function buildStandaloneCultureContext(
  culture: Pick<NamingCulture, 'id' | 'label' | 'languageIds' | 'regionIds'>,
): NamingCultureContext {
  return {
    cultureId: culture.id,
    cultureLabel: culture.label,
    languageIds: culture.languageIds ?? [],
    ...(culture.regionIds !== undefined ? { regionIds: culture.regionIds } : {}),
  }
}

export function resolveStandaloneConventions({
  cultures,
  bindings,
}: {
  cultures: readonly Pick<NamingCulture, 'id' | 'label' | 'languageIds' | 'regionIds'>[]
  bindings: Readonly<Record<string, readonly NamingConventionDefinition[]>>
}): NamingConvention[] {
  const conventions: NamingConvention[] = []
  const seenIds = new Set<string>()

  for (const culture of cultures) {
    const definitions = bindings[culture.id]
    if (definitions === undefined) {
      continue
    }

    const context = buildStandaloneCultureContext(culture)

    for (const definition of definitions) {
      const convention = resolveNamingConvention({ context, definition })
      if (seenIds.has(convention.id)) {
        continue
      }

      seenIds.add(convention.id)
      conventions.push(convention)
    }
  }

  return conventions
}
