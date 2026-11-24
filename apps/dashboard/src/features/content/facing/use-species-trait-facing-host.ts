import { useWatch } from 'react-hook-form'

import type { TraitRowForm } from '../species/lib/species-trait-form-fields'
import type { FacingHostConfig } from './facing-host-config.types'

export function useSpeciesTraitFacingHost(input: {
  fieldName: string
  selectedIndex: number | null
  hostId: 'species-traits' | 'heritage-options'
}): FacingHostConfig | undefined {
  const rowPrefix =
    input.selectedIndex === null ? undefined : `${input.fieldName}.${input.selectedIndex}`

  const selectedRow = useWatch({
    name: rowPrefix as 'traits.0',
    disabled: !rowPrefix,
  }) as TraitRowForm | undefined

  if (input.selectedIndex === null || !selectedRow) return undefined

  return { domain: 'trait', source: 'draft', hostId: input.hostId, row: selectedRow }
}
