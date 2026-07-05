import type { ContentGrant } from '../../../content/lib/grants'
import { getFeatCategoryLabel } from '../../../vocab/feat'
import { getLanguageSentenceForm } from '../../../vocab/language'
import {
  formatArmorTrainingPoolLabel,
  formatSkillProficiencyPoolLabel,
  formatToolProficiencyPoolLabel,
  formatWeaponProficiencyPoolLabel,
} from '../../../content/lib/proficiency-grant'
import type { EquipmentGrant } from '../../../content/lib/equipment-grant'
import { formatEquipmentPoolLabel } from '../../../content/lib/equipment-grant'
import type { ChoiceSet, ChoiceSourceType, ChoiceType } from '../choice-set'
import { buildChoiceSetId } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'

export type GrantChoiceSetContext = {
  sourceType: ChoiceSourceType
  sourceId: string
  slot: string
  label?: string
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
): ChoiceSet {
  const options = (grant.from ?? []).map((id) => ({
    id,
    label: getLanguageSentenceForm(id),
  }))

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
      : [{ id: pool.source, label: formatSkillProficiencyPoolLabel(pool) }]

  return buildGrantChoiceSet(
    ctx,
    'skillProficiency',
    grant.grant.choose,
    grant.grant.choose,
    options,
    true,
    'Choose Skill Proficiency',
  )
}

function weaponProficiencyChoiceSet(
  grant: Extract<ContentGrant, { kind: 'weaponProficiency' }>,
  ctx: GrantChoiceSetContext,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const options =
    pool.source === 'explicit'
      ? pool.weaponSlugs.map((id) => ({ id, label: id }))
      : [{ id: pool.source, label: formatWeaponProficiencyPoolLabel(pool) }]

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
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const options =
    pool.source === 'explicit'
      ? pool.toolSlugs.map((id) => ({ id, label: id }))
      : [{ id: pool.source, label: formatToolProficiencyPoolLabel(pool) }]

  return buildGrantChoiceSet(
    ctx,
    'toolProficiency',
    grant.grant.choose,
    grant.grant.choose,
    options,
    true,
    'Choose Tool Proficiency',
  )
}

function armorTrainingChoiceSet(
  grant: Extract<ContentGrant, { kind: 'armorTraining' }>,
  ctx: GrantChoiceSetContext,
): ChoiceSet | undefined {
  if (grant.grant.kind !== 'choice') return undefined

  const pool = grant.grant.pool
  const options =
    pool.source === 'explicit'
      ? pool.armorSlugs.map((id) => ({ id, label: id }))
      : [{ id: pool.source, label: formatArmorTrainingPoolLabel(pool) }]

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
  languageChoice: (grant, ctx) => [languageChoiceSet(grant, ctx)],
  skillProficiency: (grant, ctx, catalogIndex) =>
    toChoiceSets(skillProficiencyChoiceSet(grant, ctx, catalogIndex)),
  weaponProficiency: (grant, ctx) => toChoiceSets(weaponProficiencyChoiceSet(grant, ctx)),
  toolProficiency: (grant, ctx) => toChoiceSets(toolProficiencyChoiceSet(grant, ctx)),
  armorTraining: (grant, ctx) => toChoiceSets(armorTrainingChoiceSet(grant, ctx)),
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
