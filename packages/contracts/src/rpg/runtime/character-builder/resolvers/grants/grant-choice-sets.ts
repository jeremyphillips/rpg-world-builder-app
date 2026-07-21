import type { ContentGrant } from '../../../../content/lib/grants'
import { getFeatCategoryLabel } from '../../../../vocab/feat'
import { getLanguageLabel } from '../../../../vocab/language'
import { getProficiencyDomainLabel } from '../../../../vocab/proficiency'
import { formatEquipmentPoolLabel } from '../../../../content/lib/equipment-grant'
import type { EquipmentGrant } from '../../../../content/lib/equipment-grant'
import { resolveLanguagesFromChoiceSource } from '../../../creature/languages'
import {
  armorPoolChoiceOptions,
  listArmorMatchingPool,
  listSkillsMatchingPool,
  listWeaponsMatchingPool,
  skillPoolChoiceOptions,
  weaponPoolChoiceOptions,
} from '../../../creature/proficiencies'
import { resolveToolPoolChoiceOptions } from '../proficiency/resolve-tool-pool-choice-options'
import type { ChoiceSet, ChoiceSourceType, ChoiceType } from '../../choice-set'
import { buildChoiceSetId } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'

export type GrantChoiceSetContext = {
  sourceType: ChoiceSourceType
  sourceId: string
  slot: string
  label?: string
}

function rulesetIdFromContentId(contentId: string): string {
  const colonIndex = contentId.indexOf(':')
  return colonIndex >= 0 ? contentId.slice(0, colonIndex) : contentId
}

function resolveSkillOptionLabel(
  skillId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return catalogIndex.skillProficiencies.get(skillId)?.name ?? skillId
}

function resolveEquipmentOptionLabel(
  equipmentId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  return catalogIndex.equipment.get(equipmentId)?.name ?? equipmentId
}

function buildGrantChoiceSet(
  ctx: GrantChoiceSetContext,
  choiceType: ChoiceType,
  min: number,
  max: number,
  options: ChoiceSet['options'],
  required: boolean,
  label?: string,
): ChoiceSet {
  return {
    id: buildChoiceSetId(ctx.sourceType, ctx.sourceId, ctx.slot),
    sourceType: ctx.sourceType,
    sourceId: ctx.sourceId,
    choiceType,
    label: label ?? ctx.label ?? 'Choose',
    min,
    max,
    options,
    required,
  }
}

function equipmentPoolOptions(
  pool: Extract<EquipmentGrant, { kind: 'choice' }>['pool'],
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet['options'] {
  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.map((id) => ({
      id,
      label: resolveEquipmentOptionLabel(id, catalogIndex),
    }))
  }
  return [{ id: pool.source, label: formatEquipmentPoolLabel(pool) }]
}

function featChoiceSet(
  grant: Extract<ContentGrant, { kind: 'featChoice' }>,
  ctx: GrantChoiceSetContext,
): ChoiceSet {
  const options = grant.recommendedFeatIds?.map((id) => ({ id, label: id })) ?? []
  const categoryLabel = getFeatCategoryLabel(grant.category)

  return buildGrantChoiceSet(
    ctx,
    'feat',
    grant.choose,
    grant.choose,
    options,
    false,
    `Choose ${categoryLabel} Feat`,
  )
}

function languageChoiceSet(
  grant: Extract<ContentGrant, { kind: 'languageChoice' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet {
  const from = grant.from ?? []
  const categories = grant.categories ?? []
  const resolved = resolveLanguagesFromChoiceSource({
    languages: catalogIndex.languages,
    from,
    categories,
  })

  const options =
    from.length > 0
      ? from.map((id) => {
          const language = resolved.find((row) => row.id === id)
          return {
            id,
            label: language?.label ?? getLanguageLabel(id),
          }
        })
      : resolved.map((language) => ({ id: language.id, label: language.label }))

  return buildGrantChoiceSet(
    ctx,
    'language',
    grant.choose,
    grant.choose,
    options,
    options.length > 0,
    'Choose Language',
  )
}

function skillProficiencyChoiceSet(
  grant: Extract<ContentGrant, { kind: 'skillProficiency' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const options =
    pool.source === 'explicit'
      ? pool.skillIds.map((id) => ({ id, label: resolveSkillOptionLabel(id, catalogIndex) }))
      : skillPoolChoiceOptions(
          listSkillsMatchingPool({ pool, skills: catalogIndex.skillProficiencies }),
        )

  return buildGrantChoiceSet(
    ctx,
    'skillProficiency',
    grant.grant.choose,
    grant.grant.choose,
    options,
    true,
    `Choose ${getProficiencyDomainLabel('skill')}`,
  )
}

function weaponProficiencyChoiceSet(
  grant: Extract<ContentGrant, { kind: 'weaponProficiency' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const rulesetId = rulesetIdFromContentId(ctx.sourceId)
  const options =
    pool.source === 'explicit'
      ? pool.weaponSlugs.map((id) => ({ id, label: id }))
      : weaponPoolChoiceOptions(
          listWeaponsMatchingPool({
            pool,
            equipment: catalogIndex.equipment,
            rulesetId,
          }),
        )

  return buildGrantChoiceSet(
    ctx,
    'weaponProficiency',
    grant.grant.choose,
    grant.grant.choose,
    options,
    true,
    'Choose Weapon Proficiency',
  )
}

function toolProficiencyChoiceSet(
  grant: Extract<ContentGrant, { kind: 'toolProficiency' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const rulesetId = rulesetIdFromContentId(ctx.sourceId)
  const options = resolveToolPoolChoiceOptions(pool, catalogIndex.equipment, rulesetId)

  return buildGrantChoiceSet(
    ctx,
    'toolProficiency',
    grant.grant.choose,
    grant.grant.choose,
    options,
    options.length > 0,
    'Choose Tool Proficiency',
  )
}

function armorTrainingChoiceSet(
  grant: Extract<ContentGrant, { kind: 'armorTraining' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const rulesetId = rulesetIdFromContentId(ctx.sourceId)
  const options =
    pool.source === 'explicit'
      ? pool.armorSlugs.map((id) => ({ id, label: id }))
      : armorPoolChoiceOptions(
          listArmorMatchingPool({
            pool,
            equipment: catalogIndex.equipment,
            rulesetId,
          }),
        )

  return buildGrantChoiceSet(
    ctx,
    'armorTraining',
    grant.grant.choose,
    grant.grant.choose,
    options,
    true,
    'Choose Armor Training',
  )
}

function equipmentGrantChoiceSet(
  grant: Extract<ContentGrant, { kind: 'equipment' }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  return buildGrantChoiceSet(
    ctx,
    'equipment',
    grant.grant.choose,
    grant.grant.choose,
    equipmentPoolOptions(grant.grant.pool, catalogIndex),
    true,
    'Choose Equipment',
  )
}

function toChoiceSets(choiceSet: ChoiceSet | undefined): ChoiceSet[] {
  return choiceSet ? [choiceSet] : []
}

type GrantChoiceSetConverter<K extends ContentGrant['kind']> = (
  grant: Extract<ContentGrant, { kind: K }>,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
) => ChoiceSet[]

const GRANT_CHOICE_SET_CONVERTERS: {
  [K in ContentGrant['kind']]?: GrantChoiceSetConverter<K>
} = {
  featChoice: (grant, ctx) => [featChoiceSet(grant, ctx)],
  languageChoice: (grant, ctx, catalogIndex) => [languageChoiceSet(grant, ctx, catalogIndex)],
  skillProficiency: (grant, ctx, catalogIndex) =>
    toChoiceSets(skillProficiencyChoiceSet(grant, ctx, catalogIndex)),
  weaponProficiency: (grant, ctx, catalogIndex) =>
    toChoiceSets(weaponProficiencyChoiceSet(grant, ctx, catalogIndex)),
  toolProficiency: (grant, ctx, catalogIndex) =>
    toChoiceSets(toolProficiencyChoiceSet(grant, ctx, catalogIndex)),
  armorTraining: (grant, ctx, catalogIndex) =>
    toChoiceSets(armorTrainingChoiceSet(grant, ctx, catalogIndex)),
  equipment: (grant, ctx, catalogIndex) =>
    toChoiceSets(equipmentGrantChoiceSet(grant, ctx, catalogIndex)),
}

/** Maps a single atomic grant to zero or more ChoiceSets when the grant is player-selected. */
export function contentGrantToChoiceSets(
  grant: ContentGrant,
  ctx: GrantChoiceSetContext,
  catalogIndex: CharacterBuildCatalogIndex,
): ChoiceSet[] {
  const converter = GRANT_CHOICE_SET_CONVERTERS[grant.kind] as
    | GrantChoiceSetConverter<typeof grant.kind>
    | undefined
  return converter ? converter(grant as never, ctx, catalogIndex) : []
}
