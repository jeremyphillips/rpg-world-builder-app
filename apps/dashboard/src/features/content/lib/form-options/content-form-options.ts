import { useMemo } from 'react'
import {
  classHasSpellcasting,
  isMagicItemBaseEquipment,
  type CharacterClass,
  type ContentSource,
  type Equipment,
  type Feat,
  isWeaponEquipment,
  type Spell,
  type WeaponCategory,
} from '@rpg/contracts'
import type { RichTextLinkPickerContentTypeOption, RichTextLinkPickerInternalOption } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

import { useCampaignRules } from '@/features/campaign'
import {
  useCreatureTypeVocabulary,
  useDamageTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
  useSpellSchoolVocabulary,
} from '@/features/homebrew'

import { useClasses } from '../../classes/hooks/use-classes'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useFeats } from '../../feats/hooks/use-feats'
import { useSpells } from '../../spells/hooks/use-spells'
import type { ContentFormCtx } from '../forms/content-form-registry'
import {
  buildRichTextInternalLinkOptions,
  RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS,
} from './rich-text-link-options'

export interface ContentFormOptionSets {
  classes: FieldOption[]
  /**
   * Classes with a `spellcasting` block on the campaign-resolved catalog. Used by
   * the spell form class combobox. On edit, stale selected slugs that no longer
   * qualify are not merged here — see spells feature README (orphan union gap).
   */
  spellcastingClasses: FieldOption[]
  weapons: FieldOption[]
  /** All campaign-resolved equipment (weapons, armor, tools, gear, …), sorted by label. */
  equipment: FieldOption[]
  spells: FieldOption[]
  feats: FieldOption[]
  tools: FieldOption[]
  /** Weapons, armor, and adventuring gear eligible as a magic item base. */
  magicItemBaseEquipment: FieldOption[]
  weaponCategoryBySlug: Readonly<Partial<Record<string, WeaponCategory>>>
  /** Internal content targets shown in rich-text link pickers. */
  richTextInternalLinkOptions: RichTextLinkPickerInternalOption[]
  /** Content type filters shown in rich-text link pickers. */
  richTextContentTypeOptions: RichTextLinkPickerContentTypeOption[]
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
  campaignId?: string
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
    equipment: sortFieldOptions(input.equipment?.map(toContentFieldOption) ?? []),
    spells: sortFieldOptions(input.spells?.map(toContentFieldOption) ?? []),
    feats: sortFieldOptions(input.feats?.map(toContentFieldOption) ?? []),
    tools: sortFieldOptions(
      input.equipment?.filter((item) => item.kind === 'tool').map(toContentFieldOption) ?? [],
    ),
    magicItemBaseEquipment: sortFieldOptions(
      input.equipment?.filter(isMagicItemBaseEquipment).map(toContentFieldOption) ?? [],
    ),
    weaponCategoryBySlug: buildWeaponCategoryBySlug(input.equipment),
    richTextInternalLinkOptions: input.campaignId
      ? buildRichTextInternalLinkOptions({
          campaignId: input.campaignId,
          entitiesByType: {
            spell: input.spells,
            feat: input.feats,
          },
        })
      : [],
    richTextContentTypeOptions: [...RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS],
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
  const creatureTypeQuery = useCreatureTypeVocabulary(campaignId)
  const damageTypeQuery = useDamageTypeVocabulary(campaignId)
  const senseQuery = useSenseVocabulary(campaignId)
  const languageQuery = useLanguageVocabulary(campaignId)
  const spellSchoolQuery = useSpellSchoolVocabulary(campaignId)

  const options = useMemo(
    () =>
      buildContentFormOptionSets({
        campaignId,
        classes: classesQuery.data,
        spells: spellsQuery.data,
        feats: featsQuery.data,
        equipment: equipmentQuery.data,
      }),
    [campaignId, classesQuery.data, spellsQuery.data, featsQuery.data, equipmentQuery.data],
  )

  const ctx = useMemo(
    (): ContentFormCtx => ({
      campaignId,
      campaignRules,
      creatureTypeVocabulary: creatureTypeQuery.vocabulary,
      damageTypeVocabulary: damageTypeQuery.vocabulary,
      senseVocabulary: senseQuery.vocabulary,
      languageVocabulary: languageQuery.vocabulary,
      spellSchoolVocabulary: spellSchoolQuery.vocabulary,
      options,
    }),
    [
      campaignId,
      campaignRules,
      creatureTypeQuery.vocabulary,
      damageTypeQuery.vocabulary,
      senseQuery.vocabulary,
      languageQuery.vocabulary,
      spellSchoolQuery.vocabulary,
      options,
    ],
  )

  return {
    ctx,
    isPending:
      classesQuery.isPending ||
      spellsQuery.isPending ||
      featsQuery.isPending ||
      equipmentQuery.isPending ||
      creatureTypeQuery.isPending ||
      damageTypeQuery.isPending ||
      senseQuery.isPending ||
      languageQuery.isPending ||
      spellSchoolQuery.isPending,
    isError:
      classesQuery.isError ||
      spellsQuery.isError ||
      featsQuery.isError ||
      equipmentQuery.isError ||
      creatureTypeQuery.isError ||
      damageTypeQuery.isError ||
      senseQuery.isError ||
      languageQuery.isError ||
      spellSchoolQuery.isError,
  }
}
