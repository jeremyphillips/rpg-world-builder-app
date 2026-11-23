import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import type { FacingHostConfig } from './facing-host-config.types'
import { resolveMonsterTraitDraftFacing } from './domains/trait/resolve-trait-facing'
import type { MonsterFormValues } from '../monsters/lib/monster-form-values'

export function useMonsterTraitFacingHost(input: {
  fieldName: string
  selectedIndex: number | null
}): FacingHostConfig | undefined {
  const rowPrefix =
    input.selectedIndex === null ? undefined : `${input.fieldName}.${input.selectedIndex}`

  const name = useWatch<MonsterFormValues, 'name'>({ name: 'name' })
  const lair = useWatch<MonsterFormValues, 'lair'>({ name: 'lair' })
  const forms = useWatch<MonsterFormValues, 'forms'>({ name: 'forms' })

  const selectedRow = useWatch({
    name: rowPrefix as 'traits.0',
    disabled: !rowPrefix,
  }) as Record<string, unknown> | undefined

  const resolution = useMemo(() => {
    if (!selectedRow || typeof selectedRow !== 'object') return undefined
    return resolveMonsterTraitDraftFacing({
      row: selectedRow,
      monster: { name: name ?? '', lair, forms },
    })
  }, [forms, lair, name, selectedRow])

  if (input.selectedIndex === null || resolution === undefined) return undefined

  return {
    hostId: 'monster-traits',
    resolveSelectedFacing: () => resolution,
  }
}
