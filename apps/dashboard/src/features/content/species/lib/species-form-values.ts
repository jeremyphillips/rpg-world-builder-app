import { type CreateSpeciesInput, type Species } from '@rpg/contracts'

import { envelopeSlugFields, finalizeContentInput } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import { heritageFromFormValues, heritageToFormRow } from './species-heritage-form-values'
import {
  characterCreationFromFormValues,
  characterCreationToFormValues,
} from './species-rules-form-values'
import type { SpeciesFormValues } from './species-form-fields'
import { traitToFormRow, traitsFromFormValues } from './species-trait-form-values'

export const speciesCreateDefaultValues: Partial<SpeciesFormValues> = {
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [],
}

export function speciesToFormValues(entity: Species): SpeciesFormValues {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    creatureType: entity.creatureType,
    sizes: entity.sizes,
    speed: { walk: entity.speed.walk },
    traits: entity.traits.map(traitToFormRow),
    heritage: entity.heritage ? heritageToFormRow(entity.heritage) : undefined,
    characterCreation: characterCreationToFormValues(entity.characterCreation),
  }
}

export function buildSpeciesCreateInput(
  values: SpeciesFormValues,
  ctx?: ContentFormInputCtx<Species>,
): CreateSpeciesInput {
  const characterCreation = characterCreationFromFormValues(values.characterCreation)

  return finalizeContentInput(
    {
      ...envelopeSlugFields(values.name, ctx),
      name: values.name,
      description: values.description || undefined,
      creatureType: values.creatureType,
      sizes: values.sizes,
      speed: { walk: values.speed.walk },
      traits: traitsFromFormValues(values.traits, ctx?.entity?.traits),
      heritage: heritageFromFormValues(values.heritage, ctx?.entity?.heritage),
      ...(characterCreation ? { characterCreation } : {}),
    },
    ctx,
  ) as CreateSpeciesInput
}
