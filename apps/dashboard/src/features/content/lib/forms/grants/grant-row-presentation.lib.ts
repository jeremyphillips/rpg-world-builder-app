import {
  createEquipmentCatalogContext,
  createSpellCatalogContext,
  DAMAGE_TYPE_TERM,
  formatCreatureSenseCompactLine,
  formatDamageTypeGrantSentence,
  formatFeatChoiceGrantSentence,
  formatLanguageGrantSentence,
  formatMovementGrantAuthoringSummary,
  formatMovementGrantMetadataDetail,
  formatResistanceGrantSentence,
  formatSenseGrantSentence,
  formatSpellsGrantSentenceFromResolutions,
  getFeatCategorySentenceForm,
  LANGUAGE_TERM,
  SENSE_TERM,
  presentEquipmentReferenceDisplayName,
  presentSpellReferenceDisplayName,
  resolveEquipmentSlugReference,
  resolveEquipmentSlugReferenceOutcomes,
  resolveSpellReferenceOutcome,
  resolveSpellReferenceOutcomes,
  type AuthoringEquipmentCatalogStatus,
  type AuthoringSpellCatalogStatus,
  type Equipment,
  type EquipmentCatalogContext,
  type EquipmentCatalogScope,
  type EquipmentReferenceResolution,
  type EquipmentSlugReference,
  type MovementGrantPayload,
  type MovementMode,
  type MovementOperation,
  type SenseId,
  type Spell,
  type SpellCatalogContext,
  type SpellReference,
  type SpellReferenceResolution,
} from '@rpg/contracts'
import { INLINE_METADATA_SEPARATOR } from '@rpg/contracts/primitives'

import { limitedUseFromForm } from '../limited-use/limited-use-form.lib'

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
import { readFeatChoiceFromDraft } from './grant-form-values'

export const GRANT_TYPE_MISSING_PRIMARY = 'Grant type missing'
import type { EquipmentGrantItemForm } from './equipment/equipment-grant-form-fields'
import type {
  ArmorTrainingItemForm,
  SkillProficiencyItemForm,
  ToolProficiencyItemForm,
  WeaponProficiencyItemForm,
} from './proficiency/proficiency-grant-form-fields'

export type GrantRowValues = Record<string, unknown>

export type GrantSpellReferencePresentation = {
  catalog: SpellCatalogContext
  displayName(spellId: SpellReference): string
  outcomes(spellIds: readonly SpellReference[]): SpellReferenceResolution[]
}

export type GrantEquipmentReferencePresentation = {
  catalog: EquipmentCatalogContext
  scope: EquipmentCatalogScope
  displayName(slug: EquipmentSlugReference): string
  outcomes(slugs: readonly EquipmentSlugReference[]): EquipmentReferenceResolution[]
}

export type GrantRowHeaderContext = {
  rowLabels: Record<string, string>
  equipmentReferences: GrantEquipmentReferencePresentation
  resolveSkillName?: (slug: string) => string
  spellReferences: GrantSpellReferencePresentation
  resolveDamageTypeLabel?: (id: string) => string | undefined
  resolveLanguageLabel?: (id: string) => string | undefined
  resolveSenseLabel?: (id: string) => string | undefined
}

export function buildGrantSpellReferencePresentation(
  catalog: SpellCatalogContext,
): GrantSpellReferencePresentation {
  return {
    catalog,
    displayName(spellId) {
      return presentSpellReferenceDisplayName(resolveSpellReferenceOutcome(spellId, catalog))
    },
    outcomes(spellIds) {
      return resolveSpellReferenceOutcomes(spellIds, catalog)
    },
  }
}

export function buildGrantSpellReferencePresentationFromAuthoring(args: {
  status?: AuthoringSpellCatalogStatus
  spellsById?: ReadonlyMap<string, Spell>
}): GrantSpellReferencePresentation {
  return buildGrantSpellReferencePresentation(
    createSpellCatalogContext({
      status: args.status ?? 'pending',
      spellsById: args.spellsById,
    }),
  )
}

export function buildGrantEquipmentReferencePresentation(
  catalog: EquipmentCatalogContext,
): GrantEquipmentReferencePresentation {
  const { scope } = catalog
  return {
    catalog,
    scope,
    displayName(slug) {
      return presentEquipmentReferenceDisplayName(
        resolveEquipmentSlugReference(slug, catalog, scope),
      )
    },
    outcomes(slugs) {
      return resolveEquipmentSlugReferenceOutcomes(slugs, catalog, scope)
    },
  }
}

export function buildGrantEquipmentReferencePresentationFromAuthoring(args: {
  status?: AuthoringEquipmentCatalogStatus
  scope: EquipmentCatalogScope
  equipmentById?: ReadonlyMap<string, Equipment>
}): GrantEquipmentReferencePresentation {
  return buildGrantEquipmentReferencePresentation(
    createEquipmentCatalogContext({
      status: args.status ?? 'pending',
      scope: args.scope,
      equipmentById: args.equipmentById,
    }),
  )
}

/** Semantic row copy — renderer decides header band vs body description placement. */
export type GrantRowPresentation = {
  heading: string
  detail?: string
  description?: string
}

export { formatCompactMetadataList } from './grant-compact-metadata.lib'

function normalizePresentationPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isRedundantDetail(heading: string, detail: string | undefined): boolean {
  if (!detail) return true
  const normalizedHeading = normalizePresentationPart(heading)
  const normalizedDetail = normalizePresentationPart(detail)
  if (normalizedDetail === normalizedHeading) return true
  if (normalizedDetail.startsWith(`${normalizedHeading} —`)) return true
  if (normalizedDetail.startsWith(`${normalizedHeading} ${INLINE_METADATA_SEPARATOR}`)) return true
  const headingPrefix = new RegExp(
    `^${normalizedHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[,—${INLINE_METADATA_SEPARATOR}]`,
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

function resolveDamageTypeDetail(
  damageTypes: string[] | undefined,
  ctx: GrantRowHeaderContext,
): string | undefined {
  if (!damageTypes?.length) return undefined
  return formatCompactMetadataList(
    damageTypes.map(
      (id) => ctx.resolveDamageTypeLabel?.(id) ?? `${DAMAGE_TYPE_TERM.label} reference unavailable`,
    ),
  )
}

function readSenseGrantFact(
  type: string | undefined,
  range: number | string | undefined,
): { type: SenseId; range: number } | undefined {
  if (!type || range === undefined || range === '') return undefined
  const numericRange = Number(range)
  if (!Number.isFinite(numericRange)) return undefined
  return { type, range: numericRange }
}

function resolveFeatChoiceDetail(values: GrantRowValues): string | undefined {
  const choice = readFeatChoiceFromDraft(values['featCategory'], values['featChoose'])
  if (!choice) return undefined
  return `${choice.choose} ${getFeatCategorySentenceForm(choice.category, choice.choose)}`
}

function resolveSpellGrantDetail(
  spellIds: string[] | undefined,
  ctx: GrantRowHeaderContext,
): string | undefined {
  if (!spellIds?.length) return undefined
  const outcomes = ctx.spellReferences.outcomes(spellIds)
  return formatCompactMetadataList(outcomes.map(presentSpellReferenceDisplayName))
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
  const limitedUse = hasCasting
    ? limitedUseFromForm({
        spellUseLimit: values['spellUseLimit'] as string | undefined,
        spellUseCountKind: values['spellUseCountKind'] as string | undefined,
        spellUseCount: values['spellUseCount'] as number | string | undefined,
        spellMinimumRest: values['spellMinimumRest'] as string | undefined,
      })
    : undefined

  const outcomes = ctx.spellReferences.outcomes(spellIds)
  return formatSpellsGrantSentenceFromResolutions(
    {
      id: 'spells',
      kind: 'spells',
      ability: ability as never,
      spellIds,
      ...(hasAvailability ? { availability: 'always_prepared' as const } : {}),
      ...(hasCasting
        ? {
            casting: {
              mode: 'free_cast' as const,
              ...(limitedUse ? { limitedUse } : {}),
              ...(values['spellAllowsSlotCasting'] === true ? { allowsSlotCasting: true } : {}),
            },
          }
        : {}),
    },
    outcomes,
  )
}

type GrantRowDescriptionFormatter = (values: GrantRowValues, ctx: GrantRowHeaderContext) => string

const GRANT_ROW_DESCRIPTION_BY_TYPE: Partial<Record<string, GrantRowDescriptionFormatter>> = {
  resistances: (values, ctx) => {
    const damageTypes = values['resistances'] as string[] | undefined
    if (!damageTypes?.length) return ''
    return formatResistanceGrantSentence(damageTypes, ctx.resolveDamageTypeLabel)
  },
  damageType: (values, ctx) => {
    const damageTypes = values['damageType'] as string[] | undefined
    if (!damageTypes?.length) return ''
    return formatDamageTypeGrantSentence(damageTypes, ctx.resolveDamageTypeLabel)
  },
  senses: (values, ctx) => {
    const sense = readSenseGrantFact(
      values['senseType'] as string | undefined,
      values['senseRange'] as number | string | undefined,
    )
    const label = sense && ctx.resolveSenseLabel?.(sense.type)
    return sense && label ? formatSenseGrantSentence(sense, label) : ''
  },
  movement: (values) => {
    const grant = movementFormValuesToGrantPayload(values)
    if (!grant) return ''
    return formatMovementGrantAuthoringSummary(grant)
  },
  languages: (values, ctx) => {
    const languageId = values['language'] as string | undefined
    if (!languageId) return ''
    const label = ctx.resolveLanguageLabel?.(languageId)
    return label ? formatLanguageGrantSentence([languageId], () => label) : ''
  },
  featChoice: (values) => {
    const choice = readFeatChoiceFromDraft(values['featCategory'], values['featChoose'])
    return choice ? formatFeatChoiceGrantSentence(choice) : ''
  },
  equipment: (values, ctx) =>
    equipmentGrantSummary(values as EquipmentGrantItemForm, ctx.equipmentReferences),
  weaponProficiency: (values, ctx) =>
    weaponProficiencyGrantSummary(
      values as WeaponProficiencyItemForm,
      ctx.equipmentReferences.displayName,
    ),
  toolProficiency: (values, ctx) =>
    toolProficiencyGrantSummary(
      values as ToolProficiencyItemForm,
      ctx.equipmentReferences.displayName,
    ),
  skillProficiency: (values, ctx) =>
    skillProficiencyGrantSummary(values as SkillProficiencyItemForm, ctx.resolveSkillName),
  armorTraining: (values, ctx) =>
    armorTrainingGrantSummary(values as ArmorTrainingItemForm, ctx.equipmentReferences.displayName),
  spells: (values, ctx) => resolveSpellGrantDescription(values, ctx),
}

type GrantRowDetailFormatter = (
  values: GrantRowValues,
  ctx: GrantRowHeaderContext,
) => string | undefined

const GRANT_ROW_DETAIL_BY_TYPE: Partial<Record<string, GrantRowDetailFormatter>> = {
  resistances: (values, ctx) =>
    resolveDamageTypeDetail(values['resistances'] as string[] | undefined, ctx),
  damageType: (values, ctx) =>
    resolveDamageTypeDetail(values['damageType'] as string[] | undefined, ctx),
  senses: (values, ctx) => {
    const sense = readSenseGrantFact(
      values['senseType'] as string | undefined,
      values['senseRange'] as number | string | undefined,
    )
    if (!sense) return undefined
    const label = ctx.resolveSenseLabel?.(sense.type)
    return label
      ? formatCreatureSenseCompactLine(sense, label)
      : `${SENSE_TERM.label} reference unavailable`
  },
  movement: (values) => resolveMovementDetail(values),
  languages: (values, ctx) => {
    const id = values['language'] as string | undefined
    if (!id) return undefined
    return ctx.resolveLanguageLabel?.(id) ?? `${LANGUAGE_TERM.label} reference unavailable`
  },
  featChoice: resolveFeatChoiceDetail,
  weaponProficiency: (values, ctx) =>
    weaponProficiencyGrantDetail(
      values as WeaponProficiencyItemForm,
      ctx.equipmentReferences.displayName,
    ),
  toolProficiency: (values, ctx) =>
    toolProficiencyGrantDetail(
      values as ToolProficiencyItemForm,
      ctx.equipmentReferences.displayName,
    ),
  skillProficiency: (values, ctx) =>
    skillProficiencyGrantDetail(values as SkillProficiencyItemForm, ctx.resolveSkillName),
  armorTraining: (values, ctx) =>
    armorTrainingGrantDetail(values as ArmorTrainingItemForm, ctx.equipmentReferences.displayName),
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
