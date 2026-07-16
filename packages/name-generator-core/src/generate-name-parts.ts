import {
  NameGeneratorError,
  type GenerateNamesRequest,
  type NameCollection,
  type NameStructureDefinition,
  type NamingConvention,
  type NamingConventionPartBinding,
} from '@rpg/contracts/name-generator'

import { generateCompoundPart } from './generators/generate-compound-part'
import { generateSamplePart } from './generators/generate-sample-part'
import { generateSyllablePart } from './generators/generate-syllable-part'
import { getRequiredPartKeys } from './lib/interpolate-format'
import { createSeededRng } from './random/create-seeded-rng'
import type { SeededRandom } from './random/seeded-random'

// ---------------------------------------------------------------------------
// Generate individual part values from bound collections.
// ---------------------------------------------------------------------------

function getBindingForPart(
  convention: NamingConvention,
  partKey: string,
): NamingConventionPartBinding | undefined {
  return convention.partBindings.find((binding) => binding.partKey === partKey)
}

function generatePartFromCollection(
  collection: NameCollection,
  binding: NamingConventionPartBinding,
  rng: SeededRandom,
  request: GenerateNamesRequest,
  exclude: ReadonlySet<string>,
): string {
  switch (collection.generator.type) {
    case 'sample':
      return generateSamplePart(collection.generator, rng, {
        sourceKey: binding.sourceKey,
        genderStyle: request.genderStyle,
        exclude,
      })
    case 'syllable':
      return generateSyllablePart(collection.generator, rng)
    case 'compound':
      return generateCompoundPart(collection.generator, rng)
    default: {
      const exhaustive: never = collection.generator
      throw new NameGeneratorError(
        'invalid-asset',
        `Unsupported generator type: ${String(exhaustive)}`,
      )
    }
  }
}

export function generateNameParts(
  convention: NamingConvention,
  structure: NameStructureDefinition,
  collections: ReadonlyMap<string, NameCollection>,
  request: GenerateNamesRequest,
  attemptIndex: number,
  exclude: ReadonlySet<string> = new Set(),
): Record<string, string> {
  const rng = createSeededRng(convention.id, request.seed ?? '', String(attemptIndex))
  const partKeys = getRequiredPartKeys(structure.parts, structure.format)
  const parts: Record<string, string> = {}

  for (const partKey of partKeys) {
    const binding = getBindingForPart(convention, partKey)
    if (binding === undefined) {
      const partDef = structure.parts.find((part) => part.key === partKey)
      if (partDef?.required === false) {
        continue
      }
      throw new NameGeneratorError(
        'missing-required-part',
        `No part binding for required part "${partKey}"`,
      )
    }

    const collection = collections.get(binding.collectionId)
    if (collection === undefined) {
      throw new NameGeneratorError(
        'missing-collection',
        `Collection "${binding.collectionId}" is not loaded`,
      )
    }

    parts[partKey] = generatePartFromCollection(collection, binding, rng, request, exclude)
  }

  return parts
}
