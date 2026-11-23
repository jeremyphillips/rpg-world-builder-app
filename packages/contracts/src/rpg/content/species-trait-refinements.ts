import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../lib/add-custom-refinement-issue'
import { refineCreatureTraitTemplate, refineSpeciesTraitSenseOccurrence } from './creature/traits'
import type { SpeciesBodyTrait } from './species'

export const SPECIES_TRAIT_IN_LAIR_COUNT_MESSAGE =
  'Species traits do not use an in-lair count. Remove it.'

export function refineSpeciesTraits(
  traits: SpeciesBodyTrait[],
  ctx: z.RefinementCtx,
  options?: { publish?: boolean },
): void {
  refineSpeciesTraitSenseOccurrence(traits, ctx, options)

  traits.forEach((trait, index) => {
    if (trait.kind === 'template') {
      refineCreatureTraitTemplate(trait, ctx, { host: 'species' })
    }

    if (trait.kind !== 'template' || trait.templateId !== 'legendary-resistance') return
    const config = trait.config
    if (!config || typeof config !== 'object' || Array.isArray(config)) return
    const uses = (config as Record<string, unknown>).uses
    if (!uses || typeof uses !== 'object' || Array.isArray(uses)) return
    if ((uses as Record<string, unknown>).inLair !== undefined) {
      addCustomRefinementIssue(ctx, SPECIES_TRAIT_IN_LAIR_COUNT_MESSAGE, [
        'traits',
        index,
        'config',
        'uses',
        'inLair',
      ])
    }
  })
}
