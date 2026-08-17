import { useMemo } from 'react'
import {
  classHasSpellcasting,
  isArmorEquipment,
  isMagicItemBaseEquipment,
  type CharacterClass,
  type ContentSource,
  type ContentTypeKey,
  type Equipment,
  type Feat,
  isWeaponEquipment,
  type Location,
  type SkillProficiency,
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
} from '@/features/vocabulary'

import { useClasses } from '../../classes/hooks/use-classes'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useFeats } from '../../feats/hooks/use-feats'
import { useLocations } from '../../locations/hooks/use-locations'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { useSpells } from '../../spells/hooks/use-spells'
import type { ContentFormCtx } from '../forms/content-form-registry'
import {
  filterCampaignAvailableClasses,
  type CampaignAccessClassRow,
} from '../campaign-access/filter-campaign-available-classes.lib'
import { shouldPresentContentSource } from '../content-type-presentation'
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
  /** Campaign-resolved armor equipment, sorted by label. */
  armor: FieldOption[]
  /** All campaign-resolved equipment (weapons, armor, tools, gear, …), sorted by label. */
  equipment: FieldOption[]
  /** Full equipment entities for authoring-time pool expansion. */
  equipmentEntities?: Equipment[]
  /** Campaign-available class entities for id-valued authoring fields. */
  classEntities?: CharacterClass[]
  /**
   * Full campaign class catalog for orphan reference resolution. When omitted,
   * falls back to `classEntities` (available rows only).
   */
  campaignClassEntities?: CharacterClass[]
  /** Eligible tool proficiency choices for starting-equipment linked grants. */
  proficiencyChoiceTargets?: FieldOption[]
  spells: FieldOption[]
  feats: FieldOption[]
  skills: FieldOption[]
  tools: FieldOption[]
  /** Weapons, armor, and adventuring gear eligible as a magic item base. */
  magicItemBaseEquipment: FieldOption[]
  weaponCategoryBySlug: Readonly<Partial<Record<string, WeaponCategory>>>
  /** Internal content targets shown in rich-text link pickers. */
  richTextInternalLinkOptions: RichTextLinkPickerInternalOption[]
  /** Content type filters shown in rich-text link pickers. */
  richTextContentTypeOptions: RichTextLinkPickerContentTypeOption[]
  /** Campaign locations for parent pickers and hierarchy-aware forms. */
  locations: FieldOption[]
  locationEntities?: Location[]
}

const HOMEBREW_OPTION_DESCRIPTION = 'Homebrew'

interface QueryState {
  isPending: boolean
  isError: boolean
}

function isAnyPending(...queries: QueryState[]): boolean {
  return queries.some((query) => query.isPending)
}

function isAnyError(...queries: QueryState[]): boolean {
  return queries.some((query) => query.isError)
}

function useContentCatalogLists(campaignId: string | undefined) {
  const classesQuery = useClasses(campaignId)
  const spellsQuery = useSpells(campaignId)
  const featsQuery = useFeats(campaignId)
  const skillsQuery = useSkillProficiencies(campaignId)
  const equipmentQuery = useEquipment(campaignId)
  const locationsQuery = useLocations(campaignId)
  const queries = [
    classesQuery,
    spellsQuery,
    featsQuery,
    skillsQuery,
    equipmentQuery,
    locationsQuery,
  ]

  return {
    classes: classesQuery.data,
    spells: spellsQuery.data,
    feats: featsQuery.data,
    skills: skillsQuery.data,
    equipment: equipmentQuery.data,
    locations: locationsQuery.data,
    isPending: isAnyPending(...queries),
    isError: isAnyError(...queries),
  }
}

function useContentFormVocabulary(campaignId: string | undefined) {
  const creatureTypeQuery = useCreatureTypeVocabulary(campaignId)
  const damageTypeQuery = useDamageTypeVocabulary(campaignId)
  const senseQuery = useSenseVocabulary(campaignId)
  const languageQuery = useLanguageVocabulary(campaignId)
  const spellSchoolQuery = useSpellSchoolVocabulary(campaignId)
  const queries = [creatureTypeQuery, damageTypeQuery, senseQuery, languageQuery, spellSchoolQuery]

  return {
    creatureTypeVocabulary: creatureTypeQuery.vocabulary,
    damageTypeVocabulary: damageTypeQuery.vocabulary,
    senseVocabulary: senseQuery.vocabulary,
    languageVocabulary: languageQuery.vocabulary,
    spellSchoolVocabulary: spellSchoolQuery.vocabulary,
    isPending: isAnyPending(...queries),
    isError: isAnyError(...queries),
  }
}

interface ContentOptionEntity {
  slug: string
  name: string
  source: ContentSource
}

/** Maps a catalog entity to a combobox option (slug value, name label). */
export function toContentFieldOption(
  entity: ContentOptionEntity,
  contentType: ContentTypeKey,
): FieldOption {
  return {
    value: entity.slug,
    label: entity.name,
    ...(shouldPresentContentSource(contentType) && entity.source === 'homebrew'
      ? { description: HOMEBREW_OPTION_DESCRIPTION }
      : {}),
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

function toSortedContentFieldOptions<T extends ContentOptionEntity>(
  entities: readonly T[] | undefined,
  contentType: ContentTypeKey,
): FieldOption[] {
  return sortFieldOptions(
    entities?.map((entity) => toContentFieldOption(entity, contentType)) ?? [],
  )
}

function buildRichTextLinkOptionSets(input: {
  campaignId?: string
  spells?: Spell[]
  feats?: Feat[]
}): Pick<ContentFormOptionSets, 'richTextInternalLinkOptions' | 'richTextContentTypeOptions'> {
  const richTextInternalLinkOptions = input.campaignId
    ? buildRichTextInternalLinkOptions({
        campaignId: input.campaignId,
        entitiesByType: {
          spell: input.spells,
          feat: input.feats,
        },
      })
    : []

  return {
    richTextInternalLinkOptions,
    richTextContentTypeOptions: [...RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS],
  }
}

function buildLocationFieldOptions(locations: Location[] | undefined): FieldOption[] {
  return sortFieldOptions(
    locations?.map((location) => ({ value: location.id, label: location.name })) ?? [],
  )
}

/** Builds campaign-scoped combobox option sets from list query results. */
export function buildContentFormOptionSets(input: {
  campaignId?: string
  classes?: readonly CampaignAccessClassRow[]
  spells?: Spell[]
  feats?: Feat[]
  skills?: SkillProficiency[]
  equipment?: Equipment[]
  locations?: Location[]
}): ContentFormOptionSets {
  const catalogClasses = input.classes ?? []
  const availableClasses = filterCampaignAvailableClasses(catalogClasses)

  return {
    classes: toSortedContentFieldOptions(catalogClasses, 'classes'),
    spellcastingClasses: toSortedContentFieldOptions(
      catalogClasses.filter(classHasSpellcasting),
      'classes',
    ),
    weapons: toSortedContentFieldOptions(input.equipment?.filter(isWeaponEquipment), 'equipment'),
    armor: toSortedContentFieldOptions(input.equipment?.filter(isArmorEquipment), 'equipment'),
    equipment: toSortedContentFieldOptions(input.equipment, 'equipment'),
    equipmentEntities: input.equipment,
    classEntities: availableClasses,
    campaignClassEntities: [...catalogClasses],
    spells: toSortedContentFieldOptions(input.spells, 'spells'),
    feats: toSortedContentFieldOptions(input.feats, 'feats'),
    skills: toSortedContentFieldOptions(input.skills, 'skill-proficiencies'),
    tools: toSortedContentFieldOptions(
      input.equipment?.filter((item) => item.kind === 'tool'),
      'equipment',
    ),
    magicItemBaseEquipment: toSortedContentFieldOptions(
      input.equipment?.filter(isMagicItemBaseEquipment),
      'equipment',
    ),
    weaponCategoryBySlug: buildWeaponCategoryBySlug(input.equipment),
    locations: buildLocationFieldOptions(input.locations),
    locationEntities: input.locations,
    ...buildRichTextLinkOptionSets(input),
  }
}

export function useContentFormOptions(campaignId: string | undefined): {
  ctx: ContentFormCtx
  isPending: boolean
  isError: boolean
} {
  const catalog = useContentCatalogLists(campaignId)
  const vocabulary = useContentFormVocabulary(campaignId)
  const campaignRules = useCampaignRules(campaignId)

  const options = useMemo(
    () =>
      buildContentFormOptionSets({
        campaignId,
        classes: catalog.classes,
        spells: catalog.spells,
        feats: catalog.feats,
        skills: catalog.skills,
        equipment: catalog.equipment,
        locations: catalog.locations,
      }),
    [
      campaignId,
      catalog.classes,
      catalog.spells,
      catalog.feats,
      catalog.skills,
      catalog.equipment,
      catalog.locations,
    ],
  )

  const ctx = useMemo(
    (): ContentFormCtx => ({
      campaignId,
      campaignRules,
      creatureTypeVocabulary: vocabulary.creatureTypeVocabulary,
      damageTypeVocabulary: vocabulary.damageTypeVocabulary,
      senseVocabulary: vocabulary.senseVocabulary,
      languageVocabulary: vocabulary.languageVocabulary,
      spellSchoolVocabulary: vocabulary.spellSchoolVocabulary,
      options,
    }),
    [campaignId, campaignRules, vocabulary, options],
  )

  return {
    ctx,
    isPending: catalog.isPending || vocabulary.isPending,
    isError: catalog.isError || vocabulary.isError,
  }
}
