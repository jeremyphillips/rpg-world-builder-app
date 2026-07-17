import {
  NameGeneratorError,
  type GenerateNamesRequest,
  type GeneratedName,
  type NameCollection,
  type NameStructureDefinition,
  type NamingConvention,
} from '@rpg/contracts/name-generator'

import { assembleName } from './assemble-name'
import { generateNameParts } from './generate-name-parts'

// ---------------------------------------------------------------------------
// Resolve the structure to use for generation.
// ---------------------------------------------------------------------------

export function resolveStructure(
  convention: NamingConvention,
  structureId: string | undefined,
): NameStructureDefinition {
  if (structureId !== undefined) {
    const structure = convention.structures.find((candidate) => candidate.id === structureId)
    if (structure === undefined) {
      throw new NameGeneratorError(
        'unknown-structure',
        `Structure "${structureId}" is not defined on convention "${convention.id}"`,
      )
    }
    return structure
  }

  const sole = convention.structures[0]
  if (sole === undefined) {
    throw new NameGeneratorError(
      'unknown-structure',
      `Convention "${convention.id}" has no structures`,
    )
  }
  return sole
}

export function generateName(
  convention: NamingConvention,
  collections: ReadonlyMap<string, NameCollection>,
  request: GenerateNamesRequest,
  attemptIndex = 0,
  exclude: ReadonlySet<string> = new Set(),
): GeneratedName {
  const structure = resolveStructure(convention, request.structureId)
  const parts = generateNameParts(
    convention,
    structure,
    collections,
    request,
    attemptIndex,
    exclude,
  )
  const value = assembleName(structure, parts)

  return {
    value,
    conventionId: convention.id,
    structureId: structure.id,
    parts,
    seed: request.seed,
  }
}
