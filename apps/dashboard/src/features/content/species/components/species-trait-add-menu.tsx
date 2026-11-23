import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import { ButtonDropdown } from '@rpg/ui'

import type { TraitRowForm } from '../lib/species-trait-form-fields'
import {
  parseSpeciesTraitAcquisitionId,
  SPECIES_TRAIT_ACQUISITION_GROUPS,
  speciesTraitAcquisitionItems,
} from '../lib/species-trait-acquisition'

export function SpeciesTraitAddMenu({
  label,
  rulesetId,
  traits,
  onAcquire,
}: {
  label: string
  rulesetId?: string
  traits: readonly TraitRowForm[]
  onAcquire: (choice: NonNullable<ReturnType<typeof parseSpeciesTraitAcquisitionId>>) => void
}) {
  const items = speciesTraitAcquisitionItems(rulesetId ?? DEFAULT_SYSTEM_RULESET_ID, traits)
  return (
    <ButtonDropdown
      label={label}
      triggerPresentation="addIcon"
      groups={[...SPECIES_TRAIT_ACQUISITION_GROUPS]}
      items={items}
      onSelectItem={(id) => {
        const choice = parseSpeciesTraitAcquisitionId(id)
        if (choice) onAcquire(choice)
      }}
    />
  )
}
