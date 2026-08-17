import { useMemo } from 'react'
import {
  buildContentPurposeSelectors,
  isContentReferenceable,
  type CharacterClass,
  type ContentPurposeSelectors,
  type Equipment,
  type Feat,
  type Location,
  type SkillProficiency,
  type Spell,
  type Species,
  type WeaponCategory,
  isWeaponEquipment,
} from '@rpg/contracts'

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
import { useSpecies } from '../../species/hooks/use-species'
import { useSpells } from '../../spells/hooks/use-spells'
import type { ContentFormCtx } from '../forms/content-form-registry'
import {
  buildRichTextInternalLinkOptions,
  RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS,
} from './rich-text-link-options'
import type { RichTextLinkPickerContentTypeOption, RichTextLinkPickerInternalOption } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

export type { ContentPurposeSelectors } from '@rpg/contracts'
export {
  referenceArmorFieldOptions,
  referenceClassFieldOptions,
  referenceEquipmentFieldOptions,
  referenceMagicItemBaseEquipmentFieldOptions,
  referenceSkillFieldOptions,
  referenceSpellcastingClassFieldOptions,
  referenceSpellFieldOptions,
  referenceToolFieldOptions,
  referenceWeaponFieldOptions,
  toContentFieldOption,
  toSortedContentFieldOptions,
} from './content-field-option.lib'

export interface ContentFormOptionSets {
  classes: ContentPurposeSelectors<CharacterClass>
  species: ContentPurposeSelectors<Species>
  spells: ContentPurposeSelectors<Spell>
  feats: ContentPurposeSelectors<Feat>
  skills: ContentPurposeSelectors<SkillProficiency>
  equipment: ContentPurposeSelectors<Equipment>
  locations: ContentPurposeSelectors<Location>
  /** Eligible tool proficiency choices for starting-equipment linked grants. */
  proficiencyChoiceTargets?: FieldOption[]
  weaponCategoryBySlug: Readonly<Partial<Record<string, WeaponCategory>>>
  /** Internal content targets shown in rich-text link pickers. */
  richTextInternalLinkOptions: RichTextLinkPickerInternalOption[]
  /** Content type filters shown in rich-text link pickers. */
  richTextContentTypeOptions: RichTextLinkPickerContentTypeOption[]
}

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
  const speciesQuery = useSpecies(campaignId)
  const spellsQuery = useSpells(campaignId)
  const featsQuery = useFeats(campaignId)
  const skillsQuery = useSkillProficiencies(campaignId)
  const equipmentQuery = useEquipment(campaignId)
  const locationsQuery = useLocations(campaignId)
  const queries = [
    classesQuery,
    speciesQuery,
    spellsQuery,
    featsQuery,
    skillsQuery,
    equipmentQuery,
    locationsQuery,
  ]

  return {
    classes: classesQuery.data,
    species: speciesQuery.data,
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

function buildWeaponCategoryBySlug(
  equipment: Equipment[] | undefined,
): ContentFormOptionSets['weaponCategoryBySlug'] {
  return Object.fromEntries(
    equipment?.filter(isWeaponEquipment).map((weapon) => [weapon.slug, weapon.category]) ?? [],
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

/** Builds campaign-scoped combobox option sets from list query results. */
export function buildContentFormOptionSets(input: {
  campaignId?: string
  classes?: readonly CharacterClass[]
  species?: readonly Species[]
  spells?: Spell[]
  feats?: Feat[]
  skills?: SkillProficiency[]
  equipment?: Equipment[]
  locations?: Location[]
}): ContentFormOptionSets {
  const referenceSpells = (input.spells ?? []).filter(isContentReferenceable)
  const referenceFeats = (input.feats ?? []).filter(isContentReferenceable)

  return {
    classes: buildContentPurposeSelectors(input.classes ?? []),
    species: buildContentPurposeSelectors(input.species ?? []),
    spells: buildContentPurposeSelectors(input.spells ?? []),
    feats: buildContentPurposeSelectors(input.feats ?? []),
    skills: buildContentPurposeSelectors(input.skills ?? []),
    equipment: buildContentPurposeSelectors(input.equipment ?? []),
    locations: buildContentPurposeSelectors(input.locations ?? []),
    weaponCategoryBySlug: buildWeaponCategoryBySlug(input.equipment),
    ...buildRichTextLinkOptionSets({
      campaignId: input.campaignId,
      spells: referenceSpells,
      feats: referenceFeats,
    }),
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
        species: catalog.species,
        spells: catalog.spells,
        feats: catalog.feats,
        skills: catalog.skills,
        equipment: catalog.equipment,
        locations: catalog.locations,
      }),
    [
      campaignId,
      catalog.classes,
      catalog.species,
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
