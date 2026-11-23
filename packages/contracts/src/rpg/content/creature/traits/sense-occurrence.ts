import type { RefinementCtx } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import {
  flattenGrantGroups,
  resolveGrantGroupsFromContent,
  type ContentTrait,
} from '../../lib/grants'
import { creatureTraitTemplateSenseId, isSenseCreatureTraitTemplateId } from './sense-templates'
import { getCreatureTraitTemplate } from './templates'

export const DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE =
  'This sense is already on the species trait list.'

export const DUPLICATE_MONSTER_SENSE_MESSAGE = 'This sense type is already listed.'

export const PUBLISH_STORED_SPECIES_SENSE_TRAIT_MESSAGE =
  'Passive species senses use sense templates instead of stored sense grants.'

function senseIdsFromTrait(trait: ContentTrait): string[] {
  if (trait.kind === 'template') {
    const fromRegistry = getCreatureTraitTemplate(trait.templateId)?.senseId
    if (fromRegistry) return [fromRegistry]
    if (isSenseCreatureTraitTemplateId(trait.templateId)) {
      const senseId = creatureTraitTemplateSenseId(trait.templateId)
      if (senseId) return [senseId]
    }
    return []
  }

  const groups = resolveGrantGroupsFromContent(trait)
  return flattenGrantGroups(groups)
    .map(({ grant }) => (grant.kind === 'sense' ? grant.type : undefined))
    .filter((type): type is string => type !== undefined)
}

function traitIsPublishStoredSenseOnly(trait: ContentTrait): boolean {
  if (trait.kind === 'grant') {
    const groups = resolveGrantGroupsFromContent(trait)
    if (groups.length !== 1 || groups[0]!.grants.length !== 1) return false
    return groups[0]!.grants[0]!.kind === 'sense'
  }
  if (trait.kind !== 'custom') return false
  const groups = resolveGrantGroupsFromContent(trait)
  if (groups.length === 0) return false
  const grants = flattenGrantGroups(groups).map(({ grant }) => grant)
  const senses = grants.filter((grant) => grant.kind === 'sense')
  if (senses.length !== 1) return false
  return grants.length === 1
}

/** One sense id per species trait list (templates and nested grants). */
export function refineSpeciesTraitSenseOccurrence(
  traits: readonly ContentTrait[],
  ctx: RefinementCtx,
  options?: { publish?: boolean },
): void {
  const seen = new Map<string, number>()

  traits.forEach((trait, index) => {
    if (options?.publish && traitIsPublishStoredSenseOnly(trait)) {
      addCustomRefinementIssue(ctx, PUBLISH_STORED_SPECIES_SENSE_TRAIT_MESSAGE, ['traits', index])
    }

    for (const senseId of senseIdsFromTrait(trait)) {
      const prior = seen.get(senseId)
      if (prior !== undefined) {
        const path =
          trait.kind === 'template'
            ? (['traits', index, 'templateId'] as const)
            : (['traits', index] as const)
        addCustomRefinementIssue(ctx, DUPLICATE_SPECIES_SENSE_TRAIT_MESSAGE, [...path])
        continue
      }
      seen.set(senseId, index)
    }
  })
}

/** One sense type per monster senses array. */
export function refineMonsterSenseOccurrence(
  senses: readonly { type: string }[],
  ctx: RefinementCtx,
  pathPrefix: (string | number)[] = ['senses'],
): void {
  const seen = new Map<string, number>()
  senses.forEach((sense, index) => {
    const prior = seen.get(sense.type)
    if (prior !== undefined) {
      addCustomRefinementIssue(ctx, DUPLICATE_MONSTER_SENSE_MESSAGE, [...pathPrefix, index, 'type'])
      return
    }
    seen.set(sense.type, index)
  })
}
