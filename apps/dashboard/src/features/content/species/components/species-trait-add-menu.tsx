import { SENSE_SET_ID } from '@rpg/contracts'
import { ButtonDropdown } from '@rpg/ui'

import { buildLabelDescriptionActiveVocabulary, useVocabularySet } from '@/features/vocabulary'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { TraitRowForm } from '../lib/species-trait-form-schema'
import {
  parseSpeciesTraitAcquisitionId,
  SPECIES_TRAIT_ACQUISITION_GROUPS,
  speciesTraitAcquisitionDropdownItems,
} from '../lib/species-trait-acquisition'

export function SpeciesTraitAddMenu({
  label,
  formCtx,
  traits,
  onAcquire,
}: {
  label: string
  formCtx: ContentFormCtx
  traits: readonly TraitRowForm[]
  onAcquire: (choice: NonNullable<ReturnType<typeof parseSpeciesTraitAcquisitionId>>) => void
}) {
  const senseSetQuery = useVocabularySet(formCtx.campaignId, SENSE_SET_ID)
  const senseVocabulary = senseSetQuery.data
    ? buildLabelDescriptionActiveVocabulary(senseSetQuery.data)
    : undefined
  const senseVocabularyStatus = senseSetQuery.isPending
    ? 'pending'
    : senseSetQuery.isError
      ? 'error'
      : 'ready'

  const items = formCtx.rulesetId
    ? speciesTraitAcquisitionDropdownItems({
        rulesetId: formCtx.rulesetId,
        traits,
        senseVocabulary,
        senseVocabularyStatus,
      })
    : []

  return (
    <ButtonDropdown
      label={label}
      triggerPresentation="addIcon"
      supportingWrap
      groups={[...SPECIES_TRAIT_ACQUISITION_GROUPS]}
      items={items}
      onSelectItem={(id) => {
        const choice = parseSpeciesTraitAcquisitionId(id)
        if (choice) onAcquire(choice)
      }}
    />
  )
}
