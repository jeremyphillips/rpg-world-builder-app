import { useMemo } from 'react'
import type { ContentSource, Equipment, Spell, Weapon } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { useEquipment } from '../equipment/hooks/use-equipment'
import { useSpells } from '../spells/hooks/use-spells'
import { useWeapons } from '../weapons/hooks/use-weapons'
import type { ContentFormCtx } from './content-form-registry'

export interface ContentFormOptionSets {
  weapons: FieldOption[]
  spells: FieldOption[]
  tools: FieldOption[]
}

const HOMEBREW_OPTION_DESCRIPTION = 'Homebrew'

interface ContentOptionEntity {
  slug: string
  name: string
  source: ContentSource
}

/** Maps a catalog entity to a combobox option (slug value, name label). */
export function toContentFieldOption(entity: ContentOptionEntity): FieldOption {
  return {
    value: entity.slug,
    label: entity.name,
    ...(entity.source === 'homebrew' ? { description: HOMEBREW_OPTION_DESCRIPTION } : {}),
  }
}

function sortFieldOptions(options: FieldOption[]): FieldOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label))
}

/** Builds campaign-scoped combobox option sets from list query results. */
export function buildContentFormOptionSets(input: {
  weapons?: Weapon[]
  spells?: Spell[]
  equipment?: Equipment[]
}): ContentFormOptionSets {
  return {
    weapons: sortFieldOptions(input.weapons?.map(toContentFieldOption) ?? []),
    spells: sortFieldOptions(input.spells?.map(toContentFieldOption) ?? []),
    tools: sortFieldOptions(
      input.equipment?.filter((item) => item.kind === 'tool').map(toContentFieldOption) ?? [],
    ),
  }
}

export function useContentFormOptions(campaignId: string | undefined): {
  ctx: ContentFormCtx
  isPending: boolean
  isError: boolean
} {
  const weaponsQuery = useWeapons(campaignId)
  const spellsQuery = useSpells(campaignId)
  const equipmentQuery = useEquipment(campaignId)

  const options = useMemo(
    () =>
      buildContentFormOptionSets({
        weapons: weaponsQuery.data,
        spells: spellsQuery.data,
        equipment: equipmentQuery.data,
      }),
    [weaponsQuery.data, spellsQuery.data, equipmentQuery.data],
  )

  const ctx = useMemo(
    (): ContentFormCtx => ({
      campaignId,
      options,
    }),
    [campaignId, options],
  )

  return {
    ctx,
    isPending: weaponsQuery.isPending || spellsQuery.isPending || equipmentQuery.isPending,
    isError: weaponsQuery.isError || spellsQuery.isError || equipmentQuery.isError,
  }
}
