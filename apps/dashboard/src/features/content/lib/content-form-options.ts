import { useMemo } from 'react'
import {
  classHasSpellcasting,
  type CharacterClass,
  type ContentSource,
  type Equipment,
  type Feat,
  isWeaponEquipment,
  type Spell,
  type WeaponCategory,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { useCampaignRules } from '@/features/campaign'

import { useClasses } from '../classes/hooks/use-classes'
import { useEquipment } from '../equipment/hooks/use-equipment'
import { useFeats } from '../feats/hooks/use-feats'
import { useSpells } from '../spells/hooks/use-spells'
import type { ContentFormCtx } from './content-form-registry'

export interface ContentFormOptionSets {
  classes: FieldOption[]
  /**
   * Classes with a `spellcasting` block on the campaign-resolved catalog. Used by
   * the spell form class combobox. On edit, stale selected slugs that no longer
   * qualify are not merged here — see spells feature README (orphan union gap).
   */
  spellcastingClasses: FieldOption[]
  weapons: FieldOption[]
  spells: FieldOption[]
  feats: FieldOption[]
  tools: FieldOption[]
  weaponCategoryBySlug: Readonly<Partial<Record<string, WeaponCategory>>>
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

function buildWeaponCategoryBySlug(
  equipment: Equipment[] | undefined,
): ContentFormOptionSets['weaponCategoryBySlug'] {
  return Object.fromEntries(
    equipment?.filter(isWeaponEquipment).map((weapon) => [weapon.slug, weapon.category]) ?? [],
  )
}

/** Builds campaign-scoped combobox option sets from list query results. */
export function buildContentFormOptionSets(input: {
  classes?: CharacterClass[]
  spells?: Spell[]
  feats?: Feat[]
  equipment?: Equipment[]
}): ContentFormOptionSets {
  const classOptions = sortFieldOptions(input.classes?.map(toContentFieldOption) ?? [])
  const weapons = input.equipment?.filter(isWeaponEquipment)

  return {
    classes: classOptions,
    spellcastingClasses: sortFieldOptions(
      input.classes?.filter(classHasSpellcasting).map(toContentFieldOption) ?? [],
    ),
    weapons: sortFieldOptions(weapons?.map(toContentFieldOption) ?? []),
    weaponCategoryBySlug: buildWeaponCategoryBySlug(input.equipment),
    spells: sortFieldOptions(input.spells?.map(toContentFieldOption) ?? []),
    feats: sortFieldOptions(input.feats?.map(toContentFieldOption) ?? []),
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
  const classesQuery = useClasses(campaignId)
  const spellsQuery = useSpells(campaignId)
  const featsQuery = useFeats(campaignId)
  const equipmentQuery = useEquipment(campaignId)
  const campaignRules = useCampaignRules(campaignId)

  const options = useMemo(
    () =>
      buildContentFormOptionSets({
        classes: classesQuery.data,
        spells: spellsQuery.data,
        feats: featsQuery.data,
        equipment: equipmentQuery.data,
      }),
    [classesQuery.data, spellsQuery.data, featsQuery.data, equipmentQuery.data],
  )

  const ctx = useMemo(
    (): ContentFormCtx => ({
      campaignId,
      campaignRules,
      options,
    }),
    [campaignId, campaignRules, options],
  )

  return {
    ctx,
    isPending:
      classesQuery.isPending ||
      spellsQuery.isPending ||
      featsQuery.isPending ||
      equipmentQuery.isPending,
    isError:
      classesQuery.isError || spellsQuery.isError || featsQuery.isError || equipmentQuery.isError,
  }
}
