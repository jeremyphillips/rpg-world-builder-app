import { useCallback, useMemo, useState } from 'react'
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
import { useRulesetPatch } from '@/features/homebrew'
import { resolveCampaignSpellcastingProgression } from '@/lib/campaign-spellcasting-progression.lib'
import {
  useConditionVocabulary,
  useCreatureTypeVocabulary,
  useDamageTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
  useSizeVocabulary,
  useSpellSchoolVocabulary,
  useWeaponPropertyVocabulary,
} from '@/features/vocabulary'

import { useClasses } from '../../classes/hooks/use-classes'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useFeats } from '../../feats/hooks/use-feats'
import { useLocations } from '../../locations/hooks/use-locations'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { useSpecies } from '../../species/hooks/use-species'
import { useSpells } from '../../spells/hooks/use-spells'
import {
  failedContentFormCatalogQueries,
  refetchFailedContentFormCatalogQueries,
} from './content-form-options-retry.lib'

export type { ContentFormCatalogQuery } from './content-form-options-retry.lib'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import {
  buildRichTextInternalLinkOptions,
  RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS,
} from './rich-text-link-options'
import type { RichTextLinkPickerContentTypeOption, RichTextLinkPickerInternalOption } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

export type { ContentPurposeSelectors } from '@rpg/contracts'
export {
  referenceArmorComboboxFieldOptions,
  referenceClassFieldOptions,
  referenceEquipmentFieldOptions,
  referenceMagicItemBaseEquipmentFieldOptions,
  referenceSkillFieldOptions,
  referenceSpellcastingClassFieldOptions,
  referenceSpellFieldOptions,
  referenceToolComboboxFieldOptions,
  referenceWeaponComboboxFieldOptions,
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
  /** Ruleset slot progression options for class spellcasting.slotProgressionId. */
  spellcastingSlotProgressions?: FieldOption[]
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
    equipmentQuery,
    skillsQuery,
    spellsQuery,
    queries,
  }
}

function useContentFormVocabulary(campaignId: string | undefined) {
  const creatureTypeQuery = useCreatureTypeVocabulary(campaignId)
  const damageTypeQuery = useDamageTypeVocabulary(campaignId)
  const senseQuery = useSenseVocabulary(campaignId)
  const languageQuery = useLanguageVocabulary(campaignId)
  const spellSchoolQuery = useSpellSchoolVocabulary(campaignId)
  const sizeQuery = useSizeVocabulary(campaignId)
  const conditionQuery = useConditionVocabulary(campaignId)
  const weaponPropertyQuery = useWeaponPropertyVocabulary(campaignId)
  const queries = [
    creatureTypeQuery,
    damageTypeQuery,
    senseQuery,
    languageQuery,
    spellSchoolQuery,
    sizeQuery,
    conditionQuery,
    weaponPropertyQuery,
  ]

  return {
    creatureTypeVocabulary: creatureTypeQuery.vocabulary,
    damageTypeVocabulary: damageTypeQuery.vocabulary,
    senseVocabulary: senseQuery.vocabulary,
    languageVocabulary: languageQuery.vocabulary,
    spellSchoolVocabulary: spellSchoolQuery.vocabulary,
    sizeVocabulary: sizeQuery.vocabulary,
    conditionVocabulary: conditionQuery.vocabulary,
    weaponPropertyVocabulary: weaponPropertyQuery.vocabulary,
    isPending: isAnyPending(...queries),
    isError: isAnyError(...queries),
    queries,
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

function buildSpellcastingSlotProgressionOptions(
  spellcastingProgression?: ReturnType<typeof resolveCampaignSpellcastingProgression>,
): FieldOption[] {
  if (!spellcastingProgression) return []

  return [...spellcastingProgression.slotProgressions.values()]
    .sort((left, right) => left.label.localeCompare(right.label))
    .map((progression) => ({ value: progression.id, label: progression.label }))
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
  spellcastingProgression?: ReturnType<typeof resolveCampaignSpellcastingProgression>
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
    spellcastingSlotProgressions: buildSpellcastingSlotProgressionOptions(
      input.spellcastingProgression,
    ),
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
  isRetrying: boolean
  retryFailedQueries: () => Promise<void>
} {
  const catalog = useContentCatalogLists(campaignId)
  const vocabulary = useContentFormVocabulary(campaignId)
  const campaignRules = useCampaignRules(campaignId)
  const rulesetQuery = useRulesetPatch(campaignId)
  const rulesetPatch = rulesetQuery.data
  const rulesetId = catalog.classes?.[0]?.rulesetId ?? 'srd-cc-5.2.1'

  const spellcastingProgression = useMemo(
    () =>
      resolveCampaignSpellcastingProgression(
        rulesetId,
        rulesetPatch?.characterCreation.progression.spellcasting,
      ),
    [rulesetId, rulesetPatch?.characterCreation.progression.spellcasting],
  )

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
        spellcastingProgression,
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
      spellcastingProgression,
    ],
  )

  const ctx = useMemo(
    (): ContentFormCtx => ({
      campaignId,
      rulesetId,
      campaignRules,
      spellcastingProgression,
      creatureTypeVocabulary: vocabulary.creatureTypeVocabulary,
      damageTypeVocabulary: vocabulary.damageTypeVocabulary,
      senseVocabulary: vocabulary.senseVocabulary,
      languageVocabulary: vocabulary.languageVocabulary,
      spellSchoolVocabulary: vocabulary.spellSchoolVocabulary,
      sizeVocabulary: vocabulary.sizeVocabulary,
      conditionVocabulary: vocabulary.conditionVocabulary,
      weaponPropertyVocabulary: vocabulary.weaponPropertyVocabulary,
      options,
      equipmentCatalogById: new Map((catalog.equipment ?? []).map((item) => [item.id, item])),
      skillCatalogBySlug: new Map((catalog.skills ?? []).map((skill) => [skill.slug, skill])),
      spellCatalogById: new Map((catalog.spells ?? []).map((spell) => [spell.id, spell])),
      equipmentCatalogStatus: catalog.equipmentQuery.isError
        ? 'error'
        : catalog.equipmentQuery.isPending
          ? 'pending'
          : 'ready',
      skillCatalogStatus: catalog.skillsQuery.isError
        ? 'error'
        : catalog.skillsQuery.isPending
          ? 'pending'
          : 'ready',
      spellCatalogStatus: catalog.spellsQuery.isError
        ? 'error'
        : catalog.spellsQuery.isPending
          ? 'pending'
          : 'ready',
      armorClassRules: rulesetPatch?.mechanics.armorClass,
    }),
    [
      campaignId,
      rulesetId,
      campaignRules,
      spellcastingProgression,
      vocabulary,
      options,
      catalog.equipment,
      catalog.skills,
      catalog.equipmentQuery.isError,
      catalog.equipmentQuery.isPending,
      catalog.skillsQuery.isError,
      catalog.skillsQuery.isPending,
      catalog.spells,
      catalog.spellsQuery.isError,
      catalog.spellsQuery.isPending,
      rulesetPatch?.mechanics.armorClass,
    ],
  )

  const formQueries = useMemo(
    () => [
      ...catalog.queries,
      ...vocabulary.queries,
      {
        isPending: Boolean(campaignId) && rulesetQuery.isPending,
        isError: Boolean(campaignId) && rulesetQuery.isError,
        refetch: () => rulesetQuery.refetch(),
      },
    ],
    [campaignId, catalog.queries, rulesetQuery, vocabulary.queries],
  )

  const [isRetrying, setIsRetrying] = useState(false)

  const retryFailedQueries = useCallback(async () => {
    if (isRetrying) return
    if (failedContentFormCatalogQueries(formQueries).length === 0) return
    setIsRetrying(true)
    try {
      await refetchFailedContentFormCatalogQueries(formQueries)
    } finally {
      setIsRetrying(false)
    }
  }, [formQueries, isRetrying])

  return {
    ctx,
    isPending:
      catalog.isPending || vocabulary.isPending || (Boolean(campaignId) && rulesetQuery.isPending),
    isError: catalog.isError || vocabulary.isError || (Boolean(campaignId) && rulesetQuery.isError),
    isRetrying,
    retryFailedQueries,
  }
}
