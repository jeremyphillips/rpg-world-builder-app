import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import { resolvePlayableBuilderContent } from '@rpg/contracts'
import { Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rpg/ui'
import { useMemo } from 'react'

import { buildSpeciesSelectionPatch } from '../../../../lib/choice-sets/species-selection.lib'
import {
  IDENTITY_NAMING_SPECIES_LABEL,
  IDENTITY_NAMING_SPECIES_PLACEHOLDER,
} from '../../../../lib/naming/species-name-generation-labels'

export type IdentityNamingSpeciesSelectProps = {
  buildContext: CharacterBuildContext
  draft: CharacterBuilderDraft
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function IdentityNamingSpeciesSelect({
  buildContext,
  draft,
  onDraftChange,
}: IdentityNamingSpeciesSelectProps) {
  const speciesOptions = useMemo(
    () => resolvePlayableBuilderContent(buildContext).species,
    [buildContext],
  )

  return (
    <Field.Root id="identity-naming-species" required width="full" anatomy>
      <Field.Label id="identity-naming-species-label" htmlFor="identity-naming-species-control">
        {IDENTITY_NAMING_SPECIES_LABEL}
      </Field.Label>
      <Select
        value={draft.species.speciesId ?? ''}
        onValueChange={(speciesId) => {
          onDraftChange(buildSpeciesSelectionPatch(draft, speciesId))
        }}
      >
        <SelectTrigger
          id="identity-naming-species-control"
          aria-labelledby="identity-naming-species-label"
          className="w-full"
        >
          <SelectValue placeholder={IDENTITY_NAMING_SPECIES_PLACEHOLDER} />
        </SelectTrigger>
        <SelectContent>
          {speciesOptions.map((species) => (
            <SelectItem key={species.id} value={species.id}>
              {species.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field.Root>
  )
}
