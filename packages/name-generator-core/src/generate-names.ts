import {
  MAX_DUPLICATE_ATTEMPTS,
  MAX_GENERATE_COUNT,
  NameGeneratorError,
  type GenerateNamesRequest,
  type GeneratedName,
  type NameCollection,
  type NamingConvention,
} from '@rpg/contracts/name-generator'

import { toExclusionSet } from './lib/apply-exclusions'
import { generateName } from './generate-name'

// ---------------------------------------------------------------------------
// Generate a batch of names with exclusion and within-batch deduplication.
// ---------------------------------------------------------------------------

export function generateNames(
  convention: NamingConvention,
  collections: ReadonlyMap<string, NameCollection>,
  request: GenerateNamesRequest,
): GeneratedName[] {
  if (request.count > MAX_GENERATE_COUNT) {
    throw new NameGeneratorError(
      'generation-exhausted',
      `Count exceeds maximum of ${MAX_GENERATE_COUNT}`,
    )
  }

  const results: GeneratedName[] = []
  const exclude = toExclusionSet(request.exclude)
  const seen = new Set<string>(exclude)

  for (let index = 0; index < request.count; index += 1) {
    let generated: GeneratedName | undefined

    for (let attempt = 0; attempt < MAX_DUPLICATE_ATTEMPTS; attempt += 1) {
      const candidate = generateName(
        convention,
        collections,
        request,
        index * MAX_DUPLICATE_ATTEMPTS + attempt,
        seen,
      )
      if (!seen.has(candidate.value)) {
        generated = candidate
        break
      }
    }

    if (generated === undefined) {
      throw new NameGeneratorError(
        'generation-exhausted',
        `Could not generate a unique name at index ${index}`,
      )
    }

    seen.add(generated.value)
    results.push(generated)
  }

  return results
}
