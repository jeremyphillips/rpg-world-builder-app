import {
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatMovementGrantAuthoringSummary,
  formatMovementGrantMetadataDetail,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  formatSpellsGrantSentence,
  formatSlugAsLabel,
  getDamageTypeLabel,
  getFeatCategorySentenceForm,
  getLanguageLabel,
  getSenseLabel,
  type FeatCategory,
  type MovementGrantPayload,
  type MovementMode,
  type MovementOperation,
  type SenseId,
  type UsageFrequency,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { formatCompactMetadataList } from './grant-compact-metadata.lib'
import { equipmentGrantSummary } from './equipment/equipment-grant-form-values'
import {
  armorTrainingGrantDetail,
  armorTrainingGrantSummary,
  skillProficiencyGrantDetail,
  skillProficiencyGrantSummary,
  toolProficiencyGrantDetail,
  toolProficiencyGrantSummary,
  weaponProficiencyGrantDetail,
  weaponProficiencyGrantSummary,
} from './proficiency/proficiency-grant-form-values'
import { GRANT_TYPE_LABELS, type GrantType } from './grant-form-schema'

export const GRANT_TYPE_MISSING_PRIMARY = 'Grant type missing'
import type { EquipmentGrantItemForm } from './equipment/equipment-grant-form-fields'
import type {
  ArmorTrainingItemForm,
  SkillProficiencyItemForm,
  ToolProficiencyItemForm,
  WeaponProficiencyItemForm,
} from './proficiency/proficiency-grant-form-fields'

export type GrantRowValues = Record<string, unknown>

export type GrantRowHeaderContext = {
  rowLabels: Record<string, string>
  equipmentOptions: FieldOption[]
  weaponOptions: FieldOption[]
  toolOptions: FieldOption[]
  armorOptions: FieldOption[]
  skillOptions: FieldOption[]
  spellOptions: FieldOption[]
}

/** Semantic row copy — renderer decides header band vs body description placement. */
export type GrantRowPresentation = {
  heading: string
  detail?: string
  description?: string
}

export { formatCompactMetadataList } from './grant-compact-metadata.lib'

export function resolveSpellGrantName(slug: string, spellOptions: FieldOption[]): string {
  const matched = spellOptions.find((option) => option.value === slug)?.label
  if (matched) return matched
  return formatSlugAsLabel(slug)
}

function normalizePresentationPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isRedundantDetail(heading: string, detail: string | undefined): boolean {
  if (!detail) return true
  const normalizedHeading = normalizePresentationPart(heading)
  const normalizedDetail = normalizePresentationPart(detail)
  if (normalizedDetail === normalizedHeading) return true
  if (normalizedDetail.startsWith(`${normalizedHeading} —`)) return true
  if (normalizedDetail.startsWith(`${normalizedHeading} ·`)) return true
  const headingPrefix = new RegExp(
    `^${normalizedHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[,—·]`,
  )
  return headingPrefix.test(normalizedDetail)
}

export function omitRedundantGrantDetail(
  heading: string,
  detail: string | undefined,
): string | undefined {
  if (!detail || isRedundantDetail(heading, detail)) return undefined
  return detail
}

export function movementFormValuesToGrantPayload(values: {
  movementMode?: string
  movementOperation?: string
  movementFeet?: number | string
  movementMatchMode?: string
}): MovementGrantPayload | undefined {
  if (!values.movementMode || !values.movementOperation) return undefined
  const mode = values.movementMode as MovementMode
  const operation = values.movementOperation as MovementOperation

  if (operation === 'match') {
    if (!values.movementMatchMode || values.movementMatchMode === mode) return undefined
    return { mode, operation, matchMode: values.movementMatchMode as MovementMode }
  }

  const feetRaw = values.movementFeet
  if (feetRaw === undefined || feetRaw === '') return undefined
  const feet = typeof feetRaw === 'number' ? feetRaw : Number(feetRaw)
  if (!Number.isFinite(feet)) return undefined

  if (operation === 'increase') {
    return { mode, operation, feet: feet as never }
  }

  return { mode, operation, feet: feet as never }
}

function resolveDamageTypeDetail(damageTypes: string[] | undefined): string | undefined {
  if (!damageTypes?.length) return undefined
  return formatCompactMetadataList(damageTypes.map((id) => getDamageTypeLabel(id)))
}

function resolveLanguageDetail(languageId: string | undefined): string | undefined {
  if (!languageId) return undefined
  return getLanguageLabel(languageId)
}

function resolveSenseDetail(
  type: string | undefined,
  range: number | string | undefined,
): string | undefined {
  if (!type || range === undefined || range === '') return undefined
  const numericRange = typeof range === 'number' ? range : Number(range)
  if (!Number.isFinite(numericRange)) return undefined
  return `${getSenseLabel(type)} ${numericRange} ft`
}

function resolveFeatChoiceDetail(
  category: string | undefined,
  choose: number | string | undefined,
): string | undefined {
  if (!category) return undefined
  const numericChoose = choose === undefined || choose === '' ? 1 : Number(choose)
  if (!Number.isFinite(numericChoose)) return undefined
  return `${numericChoose} ${getFeatCategorySentenceForm(category, numericChoose)}`
}

function resolveSpellGrantDetail(
  spellIds: string[] | undefined,
  ctx: GrantRowHeaderContext,
): string | undefined {
  if (!spellIds?.length) return undefined
  return formatCompactMetadataList(
    spellIds.map((id) => resolveSpellGrantName(id, ctx.spellOptions)),
  )
}

function resolveMovementDetail(values: GrantRowValues): string | undefined {
  const grant = movementFormValuesToGrantPayload(values)
  if (!grant) return undefined
  return formatMovementGrantMetadataDetail(grant)
}

function resolveSpellGrantDescription(values: GrantRowValues, ctx: GrantRowHeaderContext): string {
  const ability = values['spellAbility']
  const spellIds = values['spellIds'] as string[] | undefined
  if (!ability || !spellIds?.length) return ''

  const hasAvailability = values['spellAvailability'] === true
  const hasCasting = values['spellCastingEnabled'] === true
  if (!hasAvailability && !hasCasting) return ''

  return formatSpellsGrantSentence(
    {
      kind: 'spells',
      ability: ability as never,
      spellIds,
      ...(hasAvailability ? { availability: 'always_prepared' as const } : {}),
      ...(hasCasting && values['spellCastingFrequency']
        ? {
            casting: {
              mode: 'free_cast' as const,
              frequency: values['spellCastingFrequency'] as UsageFrequency,
              ...(values['spellAllowsSlotCasting'] === true ? { allowsSlotCasting: true } : {}),
            },
          }
        : {}),
    },
    (id) => resolveSpellGrantName(id, ctx.spellOptions),
  )
}

type GrantRowDescriptionFormatter = (values: GrantRowValues, ctx: GrantRowHeaderContext) => string

const GRANT_ROW_DESCRIPTION_BY_TYPE: Partial<Record<string, GrantRowDescriptionFormatter>> = {
  resistances: (values) => {
    const damageTypes = values['resistances'] as string[] | undefined
    if (!damageTypes?.length) return ''
    return formatResistanceGrantSentence(damageTypes)
  },
  damageType: (values) => {
    const damageTypes = values['damageType'] as string[] | undefined
    if (!damageTypes?.length) return ''
    return formatDamageTypeGrantSentence(damageTypes)
  },
  senses: (values) => {
    const type = values['senseType'] as string | undefined
    const range = values['senseRange'] as number | string | undefined
    if (!type || range === undefined || range === '') return ''
    const numericRange = typeof range === 'number' ? range : Number(range)
    if (!Number.isFinite(numericRange)) return ''
    return formatSenseGrantSentence({ type: type as SenseId, range: numericRange })
  },
  movement: (values) => {
    const grant = movementFormValuesToGrantPayload(values)
    if (!grant) return ''
    return formatMovementGrantAuthoringSummary(grant)
  },
  languages: (values) => {
    const languageId = values['language'] as string | undefined
    if (!languageId) return ''
    return formatLanguageGrantSentence([languageId])
  },
  featChoice: (values) => {
    const category = values['featCategory'] as string | undefined
    const choose = values['featChoose'] as number | string | undefined
    if (!category) return ''
    const numericChoose = choose === undefined || choose === '' ? 1 : Number(choose)
    if (!Number.isFinite(numericChoose)) return ''
    return formatFeatChoiceGrantSentence({
      category: category as FeatCategory,
      choose: numericChoose,
    })
  },
  equipment: (values, ctx) =>
    equipmentGrantSummary(values as EquipmentGrantItemForm, ctx.equipmentOptions),
  weaponProficiency: (values, ctx) =>
    weaponProficiencyGrantSummary(values as WeaponProficiencyItemForm, ctx.weaponOptions),
  toolProficiency: (values, ctx) =>
    toolProficiencyGrantSummary(values as ToolProficiencyItemForm, ctx.toolOptions),
  skillProficiency: (values, ctx) =>
    skillProficiencyGrantSummary(values as SkillProficiencyItemForm, ctx.skillOptions),
  armorTraining: (values, ctx) =>
    armorTrainingGrantSummary(values as ArmorTrainingItemForm, ctx.armorOptions),
  spells: (values, ctx) => resolveSpellGrantDescription(values, ctx),
}

type GrantRowDetailFormatter = (
  values: GrantRowValues,
  ctx: GrantRowHeaderContext,
) => string | undefined

const GRANT_ROW_DETAIL_BY_TYPE: Partial<Record<string, GrantRowDetailFormatter>> = {
  resistances: (values) => resolveDamageTypeDetail(values['resistances'] as string[] | undefined),
  damageType: (values) => resolveDamageTypeDetail(values['damageType'] as string[] | undefined),
  senses: (values) =>
    resolveSenseDetail(
      values['senseType'] as string | undefined,
      values['senseRange'] as number | string | undefined,
    ),
  movement: (values) => resolveMovementDetail(values),
  languages: (values) => resolveLanguageDetail(values['language'] as string | undefined),
  featChoice: (values) =>
    resolveFeatChoiceDetail(
      values['featCategory'] as string | undefined,
      values['featChoose'] as number | string | undefined,
    ),
  weaponProficiency: (values, ctx) =>
    weaponProficiencyGrantDetail(values as WeaponProficiencyItemForm, ctx.weaponOptions),
  toolProficiency: (values, ctx) =>
    toolProficiencyGrantDetail(values as ToolProficiencyItemForm, ctx.toolOptions),
  skillProficiency: (values, ctx) =>
    skillProficiencyGrantDetail(values as SkillProficiencyItemForm, ctx.skillOptions),
  armorTraining: (values, ctx) =>
    armorTrainingGrantDetail(values as ArmorTrainingItemForm, ctx.armorOptions),
  spells: (values, ctx) => resolveSpellGrantDetail(values['spellIds'] as string[] | undefined, ctx),
}

function resolveGrantRowHeading(grantType: string): string | undefined {
  if (grantType in GRANT_TYPE_LABELS) {
    return GRANT_TYPE_LABELS[grantType as GrantType]
  }
  return undefined
}

/** Semantic resolution only — no index, no array fallback labels. */
export function resolveGrantRowPresentation(
  values: GrantRowValues,
  ctx: GrantRowHeaderContext,
): GrantRowPresentation | undefined {
  const grantType = values['grantType']
  if (typeof grantType !== 'string' || grantType.length === 0) {
    return { heading: GRANT_TYPE_MISSING_PRIMARY }
  }

  const heading = resolveGrantRowHeading(grantType) ?? ctx.rowLabels[grantType]
  if (!heading) return undefined

  const rawDetail = GRANT_ROW_DETAIL_BY_TYPE[grantType]?.(values, ctx)
  const detail = omitRedundantGrantDetail(heading, rawDetail)
  const description = GRANT_ROW_DESCRIPTION_BY_TYPE[grantType]?.(values, ctx)

  return {
    heading,
    ...(detail ? { detail } : {}),
    ...(description ? { description } : {}),
  }
}

/** Neutral row label for CollapsibleListItem — expand/collapse prefixes are added by the shell. */
export function formatGrantRowToolbarAriaLabel(
  presentation: Pick<GrantRowPresentation, 'heading' | 'detail'>,
): string {
  if (presentation.detail) {
    return `${presentation.heading}, ${presentation.detail}`
  }
  return presentation.heading
}

/** Full disclosure control label when the consumer does not auto-prefix expand/collapse. */
export function formatGrantRowDisclosureAriaLabel(
  presentation: Pick<GrantRowPresentation, 'heading' | 'detail'>,
  action: 'Expand' | 'Collapse',
): string {
  return `${action} ${formatGrantRowToolbarAriaLabel(presentation)}`
}
