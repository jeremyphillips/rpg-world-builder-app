import { z } from 'zod'
import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  abilitySchema,
  formatRequirementExpression,
  levelSchema,
  type RequirementExpression,
} from '@rpg/contracts'
import type { RefinementCtx } from 'zod'

export const REQUIREMENT_LEAF_TYPES = [
  'minLevel',
  'abilityMinimum',
  'spellcasting',
  'feature',
] as const

export type RequirementLeafType = (typeof REQUIREMENT_LEAF_TYPES)[number]

export type RequirementLeafForm =
  | { id: string; type: 'minLevel'; level: number }
  | { id: string; type: 'abilityMinimum'; ability: z.infer<typeof abilitySchema>; minimum: number }
  | { id: string; type: 'spellcasting' }
  | { id: string; type: 'feature'; featureId: string }

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

const requirementFeatureLeafSchema = z.object({
  id: z.string().min(1),
  type: z.literal('feature'),
  featureId: z.string(),
})

export const requirementLeafFormSchema = z.discriminatedUnion('type', [
  requirementMinLevelLeafSchema,
  requirementAbilityMinimumLeafSchema,
  requirementSpellcastingLeafSchema,
  requirementFeatureLeafSchema,
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

/** Default leaf row for the requirement editor UI. */
export function newRequirementLeaf(type: RequirementLeafType = 'minLevel'): RequirementLeafForm {
  const id = newRequirementLeafId()
  switch (type) {
    case 'minLevel':
      return { id, type, level: 1 }
    case 'abilityMinimum':
      return { id, type, ability: 'str', minimum: ABILITY_SCORE_MIN }
    case 'spellcasting':
      return { id, type }
    case 'feature':
      return { id, type, featureId: '' }
  }
}

/** Default group row for the requirement editor UI. */
export function newRequirementGroup(
  kind: RequirementGroupForm['kind'] = 'all',
): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind,
    requirements: [newRequirementLeaf()],
  }
}

function isSupportedEditorLeaf(
  expr: RequirementExpression,
): expr is Exclude<
  RequirementExpression,
  { kind: 'all' } | { kind: 'any' } | { kind: 'classLevel' }
> {
  return (
    expr.kind === 'minLevel' ||
    expr.kind === 'abilityMinimum' ||
    expr.kind === 'feature' ||
    expr.kind === 'spellcasting'
  )
}

function leafFromExpression(
  expr: Exclude<RequirementExpression, { kind: 'all' } | { kind: 'any' } | { kind: 'classLevel' }>,
): RequirementLeafForm {
  const id = newRequirementLeafId()
  switch (expr.kind) {
    case 'minLevel':
      return { id, type: 'minLevel', level: expr.level }
    case 'abilityMinimum':
      return { id, type: 'abilityMinimum', ability: expr.ability, minimum: expr.minimum }
    case 'spellcasting':
      return { id, type: 'spellcasting' }
    case 'feature':
      return { id, type: 'feature', featureId: expr.featureId }
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

function leafToExpression(leaf: RequirementLeafForm): RequirementExpression {
  switch (leaf.type) {
    case 'minLevel':
      return { kind: 'minLevel', level: levelSchema.parse(leaf.level) }
    case 'abilityMinimum':
      return {
        kind: 'abilityMinimum',
        ability: leaf.ability,
        minimum: leaf.minimum,
      }
    case 'spellcasting':
      return { kind: 'spellcasting' }
    case 'feature':
      return { kind: 'feature', featureId: leaf.featureId.trim() }
  }
}

function groupToExpression(group: RequirementGroupForm): RequirementExpression {
  const requirements = group.requirements.map(leafToExpression)

  if (group.kind === 'any') {
    return { kind: 'any', requirements }
  }

  if (requirements.length === 1) {
    return requirements[0]!
  }

  return { kind: 'all', requirements }
}

/** Maps validated editor state to a canonical RequirementExpression tree. */
export function requirementEditorToExpression(
  value: PrerequisiteEditorValue,
): RequirementExpression | undefined {
  if (value.groups.length === 0) {
    return undefined
  }

  const groupExpressions = value.groups.map(groupToExpression)

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
): void {
  const path = ['prerequisiteEditor', 'groups', groupIndex, 'requirements', leafIndex]

  switch (leaf.type) {
    case 'minLevel':
      if (!levelSchema.safeParse(leaf.level).success) {
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
    case 'feature':
      if (!leaf.featureId.trim()) {
        addCustomIssue(ctx, [...path, 'featureId'], 'Feature ID is required')
      }
      return
    case 'spellcasting':
      return
  }
}

/** Zod superRefine hook for prerequisite editor groups and leaf rows. */
export function refineRequirementEditor(value: PrerequisiteEditorValue, ctx: RefinementCtx): void {
  value.groups.forEach((group, groupIndex) => {
    if (group.requirements.length === 0) {
      addCustomIssue(
        ctx,
        ['prerequisiteEditor', 'groups', groupIndex, 'requirements'],
        'Add at least one requirement',
      )
    }

    group.requirements.forEach((leaf, leafIndex) => {
      validateLeaf(leaf, groupIndex, leafIndex, ctx)
    })
  })
}

/** Player-facing preview for the requirement editor. */
export function formatRequirementEditorPreview(value: PrerequisiteEditorValue): string {
  const expression = requirementEditorToExpression(value)
  if (!expression) {
    return 'No prerequisites'
  }
  return `Requires ${formatRequirementExpression(expression)}`
}
