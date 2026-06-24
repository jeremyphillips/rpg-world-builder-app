import { z } from 'zod'
import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  abilitySchema,
  campaignLevelSchema,
  formatRequirementExpression,
  MAX_CHARACTER_LEVEL,
  type RequirementExpression,
} from '@rpg/contracts'
import type { RefinementCtx } from 'zod'

export const REQUIREMENT_LEAF_TYPES = ['minLevel', 'abilityMinimum', 'spellcasting'] as const

export type RequirementLeafType = (typeof REQUIREMENT_LEAF_TYPES)[number]

export type RequirementLeafDraftForm = {
  id: string
}

export type RequirementLeafTypedForm =
  | { id: string; type: 'minLevel'; level: number }
  | { id: string; type: 'abilityMinimum'; ability: z.infer<typeof abilitySchema>; minimum: number }
  | { id: string; type: 'spellcasting' }

export type RequirementLeafForm = RequirementLeafDraftForm | RequirementLeafTypedForm

export type RequirementGroupForm = {
  id: string
  kind: 'all' | 'any'
  requirements: RequirementLeafForm[]
}

export type PrerequisiteEditorValue = {
  groups: RequirementGroupForm[]
}

const requirementMinLevelLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('minLevel'),
  level: z.coerce.number().int(),
})

const requirementAbilityMinimumLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('abilityMinimum'),
  ability: abilitySchema,
  minimum: z.coerce.number().int(),
})

const requirementSpellcastingLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('spellcasting'),
})

const requirementDraftLeafSchema = z.object({
  id: z.string().min(1),
})

export const requirementLeafFormSchema = z.union([
  requirementDraftLeafSchema,
  z.discriminatedUnion('type', [
    requirementMinLevelLeafSchema,
    requirementAbilityMinimumLeafSchema,
    requirementSpellcastingLeafSchema,
  ]),
])

export const requirementGroupFormSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['all', 'any']),
  requirements: z.array(requirementLeafFormSchema).min(1),
})

export const prerequisiteEditorSchema = z.object({
  groups: z.array(requirementGroupFormSchema),
})

export function newRequirementLeafId(): string {
  return crypto.randomUUID()
}

export function newRequirementGroupId(): string {
  return crypto.randomUUID()
}

/** Default empty prerequisite editor state. */
export function requirementEditorDefaultValue(): PrerequisiteEditorValue {
  return { groups: [] }
}

/** Untyped leaf row shown until the author picks a condition type. */
export function newRequirementDraftLeaf(): RequirementLeafDraftForm {
  return { id: newRequirementLeafId() }
}

/** Default leaf row for the requirement editor UI once a type is chosen. */
export function newRequirementLeaf(type: RequirementLeafType): RequirementLeafTypedForm {
  const id = newRequirementLeafId()
  switch (type) {
    case 'minLevel':
      return { id, type, level: 1 }
    case 'abilityMinimum':
      return { id, type, ability: 'str', minimum: ABILITY_SCORE_MIN }
    case 'spellcasting':
      return { id, type }
  }
}

/** Default group row for the requirement editor UI. */
export function newRequirementGroup(
  kind: RequirementGroupForm['kind'] = 'all',
): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind,
    requirements: [newRequirementDraftLeaf()],
  }
}

type EditableRequirementLeaf = Exclude<
  RequirementExpression,
  { kind: 'all' } | { kind: 'any' } | { kind: 'classLevel' } | { kind: 'feature' }
>

function isSupportedEditorLeaf(expr: RequirementExpression): expr is EditableRequirementLeaf {
  return expr.kind === 'minLevel' || expr.kind === 'abilityMinimum' || expr.kind === 'spellcasting'
}

function leafFromExpression(expr: EditableRequirementLeaf): RequirementLeafForm {
  const id = newRequirementLeafId()
  switch (expr.kind) {
    case 'minLevel':
      return { id, type: 'minLevel', level: expr.level }
    case 'abilityMinimum':
      return { id, type: 'abilityMinimum', ability: expr.ability, minimum: expr.minimum }
    case 'spellcasting':
      return { id, type: 'spellcasting' }
  }
}

function groupFromAny(expr: Extract<RequirementExpression, { kind: 'any' }>): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind: 'any',
    requirements: expr.requirements
      .filter(isSupportedEditorLeaf)
      .map((req) => leafFromExpression(req)),
  }
}

function groupFromAllLeaves(leaves: RequirementLeafForm[]): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind: 'all',
    requirements: leaves,
  }
}

/** Maps a stored requirement tree to the v1 group editor shape. */
export function requirementExpressionToEditor(
  prerequisite?: RequirementExpression,
): PrerequisiteEditorValue {
  if (!prerequisite) {
    return requirementEditorDefaultValue()
  }

  if (isSupportedEditorLeaf(prerequisite)) {
    return { groups: [groupFromAllLeaves([leafFromExpression(prerequisite)])] }
  }

  if (prerequisite.kind === 'any') {
    return { groups: [groupFromAny(prerequisite)] }
  }

  if (prerequisite.kind !== 'all') {
    return requirementEditorDefaultValue()
  }

  const groups: RequirementGroupForm[] = []
  let andLeaves: RequirementLeafForm[] = []

  const flushAndGroup = () => {
    if (andLeaves.length === 0) return
    groups.push(groupFromAllLeaves(andLeaves))
    andLeaves = []
  }

  for (const child of prerequisite.requirements) {
    if (child.kind === 'any') {
      flushAndGroup()
      groups.push(groupFromAny(child))
      continue
    }

    if (isSupportedEditorLeaf(child)) {
      andLeaves.push(leafFromExpression(child))
      continue
    }

    if (child.kind === 'all' && child.requirements.every(isSupportedEditorLeaf)) {
      andLeaves.push(...child.requirements.map((req) => leafFromExpression(req)))
    }
  }

  flushAndGroup()
  return { groups }
}

function isRequirementLeafDraft(leaf: unknown): leaf is RequirementLeafDraftForm {
  if (!leaf || typeof leaf !== 'object') return false
  return !('type' in leaf)
}

function isRequirementLeafForm(leaf: unknown): leaf is RequirementLeafTypedForm {
  if (!leaf || typeof leaf !== 'object') return false
  return REQUIREMENT_LEAF_TYPES.includes((leaf as RequirementLeafTypedForm).type)
}

function isRequirementLeafRow(leaf: unknown): leaf is RequirementLeafForm {
  return isRequirementLeafDraft(leaf) || isRequirementLeafForm(leaf)
}

function isRequirementGroupForm(group: unknown): group is RequirementGroupForm {
  if (!group || typeof group !== 'object') return false
  const record = group as RequirementGroupForm
  return (record.kind === 'all' || record.kind === 'any') && Array.isArray(record.requirements)
}

/** Drops transient holes from react-hook-form field arrays before serialization. */
function normalizeEditorValue(value: PrerequisiteEditorValue | undefined): PrerequisiteEditorValue {
  return {
    groups: (value?.groups ?? []).filter(isRequirementGroupForm).map((group) => ({
      ...group,
      requirements: group.requirements.filter(isRequirementLeafRow),
    })),
  }
}

function leafToExpression(leaf: RequirementLeafTypedForm, maxLevel: number): RequirementExpression {
  switch (leaf.type) {
    case 'minLevel':
      return { kind: 'minLevel', level: campaignLevelSchema(maxLevel).parse(leaf.level) }
    case 'abilityMinimum':
      return {
        kind: 'abilityMinimum',
        ability: leaf.ability,
        minimum: leaf.minimum,
      }
    case 'spellcasting':
      return { kind: 'spellcasting' }
  }
}

function tryMinLevelPreview(level: unknown, maxLevel: number): RequirementExpression | undefined {
  const parsed = campaignLevelSchema(maxLevel).safeParse(level)
  return parsed.success ? { kind: 'minLevel', level: parsed.data } : undefined
}

function isValidAbilityMinimumScore(minimum: unknown): minimum is number {
  return (
    typeof minimum === 'number' &&
    Number.isInteger(minimum) &&
    minimum >= ABILITY_SCORE_MIN &&
    minimum <= ABILITY_SCORE_MAX
  )
}

function tryAbilityMinimumPreview(
  leaf: Extract<RequirementLeafForm, { type: 'abilityMinimum' }>,
): RequirementExpression | undefined {
  const ability = abilitySchema.safeParse(leaf.ability)
  if (!ability.success || !isValidAbilityMinimumScore(leaf.minimum)) return undefined
  return { kind: 'abilityMinimum', ability: ability.data, minimum: leaf.minimum }
}

/** Best-effort leaf conversion for live preview while the user is still editing. */
function tryLeafToExpression(
  leaf: RequirementLeafTypedForm,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): RequirementExpression | undefined {
  switch (leaf.type) {
    case 'minLevel':
      return tryMinLevelPreview(leaf.level, maxLevel)
    case 'abilityMinimum':
      return tryAbilityMinimumPreview(leaf)
    case 'spellcasting':
      return { kind: 'spellcasting' }
  }
}

function groupToExpression(
  group: RequirementGroupForm,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): RequirementExpression {
  const requirements = group.requirements
    .filter(isRequirementLeafForm)
    .map((leaf) => leafToExpression(leaf, maxLevel))

  if (group.kind === 'any') {
    return { kind: 'any', requirements }
  }

  if (requirements.length === 1) {
    return requirements[0]!
  }

  return { kind: 'all', requirements }
}

function groupToPreviewExpression(
  group: RequirementGroupForm,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): RequirementExpression | undefined {
  const requirements = group.requirements
    .filter(isRequirementLeafForm)
    .map((leaf) => tryLeafToExpression(leaf, maxLevel))
    .filter((expr): expr is RequirementExpression => expr != null)

  if (requirements.length === 0) return undefined

  if (group.kind === 'any') {
    return { kind: 'any', requirements }
  }

  if (requirements.length === 1) {
    return requirements[0]
  }

  return { kind: 'all', requirements }
}

function requirementEditorToPreviewExpression(
  value: PrerequisiteEditorValue | undefined,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): RequirementExpression | undefined {
  const groupExpressions = normalizeEditorValue(value)
    .groups.map((group) => groupToPreviewExpression(group, maxLevel))
    .filter((expr): expr is RequirementExpression => expr != null)

  if (groupExpressions.length === 0) return undefined
  if (groupExpressions.length === 1) return groupExpressions[0]
  return { kind: 'all', requirements: groupExpressions }
}

/** Maps validated editor state to a canonical RequirementExpression tree. */
export function requirementEditorToExpression(
  value: PrerequisiteEditorValue,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): RequirementExpression | undefined {
  const normalized = normalizeEditorValue(value)
  if (normalized.groups.length === 0) {
    return undefined
  }

  const groupExpressions = normalized.groups.map((group) => groupToExpression(group, maxLevel))

  if (groupExpressions.length === 1) {
    return groupExpressions[0]
  }

  return { kind: 'all', requirements: groupExpressions }
}

function addCustomIssue(ctx: RefinementCtx, path: (string | number)[], message: string): void {
  ctx.addIssue({ code: 'custom', message, path })
}

function validateLeaf(
  leaf: RequirementLeafForm,
  groupIndex: number,
  leafIndex: number,
  ctx: RefinementCtx,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): void {
  const path = ['prerequisiteEditor', 'groups', groupIndex, 'requirements', leafIndex]

  if (!isRequirementLeafForm(leaf)) {
    addCustomIssue(ctx, [...path, 'type'], 'Condition type is required')
    return
  }

  switch (leaf.type) {
    case 'minLevel':
      if (!campaignLevelSchema(maxLevel).safeParse(leaf.level).success) {
        addCustomIssue(ctx, [...path, 'level'], 'Minimum character level is required')
      }
      return
    case 'abilityMinimum':
      if (leaf.minimum < ABILITY_SCORE_MIN || leaf.minimum > ABILITY_SCORE_MAX) {
        addCustomIssue(
          ctx,
          [...path, 'minimum'],
          `Minimum score must be between ${ABILITY_SCORE_MIN} and ${ABILITY_SCORE_MAX}`,
        )
      }
      return
    case 'spellcasting':
      return
  }
}

/** Zod superRefine hook for prerequisite editor groups and leaf rows. */
export function refineRequirementEditor(
  value: PrerequisiteEditorValue,
  ctx: RefinementCtx,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): void {
  value.groups.forEach((group, groupIndex) => {
    if (group.requirements.length === 0) {
      addCustomIssue(
        ctx,
        ['prerequisiteEditor', 'groups', groupIndex, 'requirements'],
        'Add at least one requirement',
      )
    }

    group.requirements.forEach((leaf, leafIndex) => {
      validateLeaf(leaf, groupIndex, leafIndex, ctx, maxLevel)
    })
  })
}

/** Player-facing preview for the requirement editor. */
export function formatRequirementEditorPreview(
  value: PrerequisiteEditorValue | undefined,
  maxLevel: number = MAX_CHARACTER_LEVEL,
): string {
  const expression = requirementEditorToPreviewExpression(value, maxLevel)
  if (!expression) {
    return 'No prerequisites'
  }
  return `Requires ${formatRequirementExpression(expression)}`
}
