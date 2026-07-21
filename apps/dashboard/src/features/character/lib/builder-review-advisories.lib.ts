import type { CharacterBuilderDraft } from '@rpg/contracts'

import { getContentTypeMidSentenceLabel } from '@/features/content/lib/content-type-labels'

export const BUILDER_ASI_FEAT_MODELING_ADVISORY =
  'Higher-level ability score improvements and feat choices are not yet modeled. This character uses its initial ability scores.'

export const BUILDER_SPECIES_HIGHER_LEVEL_CHOICE_ADVISORY = `Higher-level ${getContentTypeMidSentenceLabel('species')} traits that require player choices are not yet supported in the builder.`

export function resolveBuilderModelingAdvisories(draft: CharacterBuilderDraft): string[] {
  const advisories: string[] = []

  if (draft.class.level >= 4) {
    advisories.push(BUILDER_ASI_FEAT_MODELING_ADVISORY)
  }

  return advisories
}
