import { generateName } from '@rpg/name-generator-core'
import { loadNameCollection } from '@rpg/name-generator-data'

import { composeAvailableNamingConventions } from './compose-available-naming-conventions'
import { resolveSpeciesPersonNaming } from './resolve-species-person-naming'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

type GlobalWithWebCrypto = typeof globalThis & {
  crypto?: {
    randomUUID?: () => string
  }
}

function createGenerationSeed(): string {
  const cryptoApi = (globalThis as GlobalWithWebCrypto).crypto
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export type SpeciesPersonNameGenerationResult =
  | { ok: true; name: string }
  | { ok: false; kind: 'unsupported'; reason: string }
  | { ok: false; kind: 'generation_failed' }

/**
 * Species-aware, user-triggered person name generation.
 * Thin orchestration over naming resolution, collection loading, and core generation.
 */
export async function generateSpeciesPersonName(
  speciesInput: SpeciesCultureInput,
): Promise<SpeciesPersonNameGenerationResult> {
  const { conventions, getConvention } = composeAvailableNamingConventions([speciesInput])
  const resolution = resolveSpeciesPersonNaming({ species: speciesInput, conventions })

  if (!resolution.supported) {
    return { ok: false, kind: 'unsupported', reason: resolution.reason }
  }

  const convention = getConvention(resolution.conventionIds[0]!)
  if (!convention) {
    return { ok: false, kind: 'generation_failed' }
  }

  try {
    const collections = new Map(
      await Promise.all(
        convention.collectionIds.map(
          async (collectionId) => [collectionId, await loadNameCollection(collectionId)] as const,
        ),
      ),
    )

    const generated = generateName(
      convention,
      collections,
      {
        conventionId: convention.id,
        count: 1,
        seed: createGenerationSeed(),
        genderStyle: 'neutral',
      },
      0,
      new Set<string>(),
    )

    if (!generated.value.trim()) {
      return { ok: false, kind: 'generation_failed' }
    }

    return { ok: true, name: generated.value }
  } catch {
    return { ok: false, kind: 'generation_failed' }
  }
}
