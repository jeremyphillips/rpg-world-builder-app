import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { TraitRowForm } from '../species/lib/species-trait-form-fields'
import type { FacingHostConfig } from './facing-host-config.types'
import { resolveFacing } from './resolve-facing'

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

  const resolution = useMemo(() => {
    if (!selectedRow) return undefined
    const id = typeof selectedRow.id === 'string' ? selectedRow.id.trim() : ''
    if (!id) return undefined
    if (selectedRow.kind === 'custom') return undefined
    return resolveFacing({
      domain: 'trait',
      source: 'draft',
      hostId: input.hostId,
      row: { ...selectedRow, id },
    })
  }, [input.hostId, selectedRow])

  if (input.selectedIndex === null || resolution === undefined) return undefined

  return {
    hostId: input.hostId,
    resolveSelectedFacing: () => resolution,
  }
}
