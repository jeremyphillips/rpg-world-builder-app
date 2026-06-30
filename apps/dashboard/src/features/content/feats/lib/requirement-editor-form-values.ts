import {
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  abilitySchema,
  campaignLevelSchema,
  MAX_CHARACTER_LEVEL,
  type RequirementExpression,
} from '@rpg/contracts'

import {
  newRequirementGroupId,
  newRequirementLeafId,
  REQUIREMENT_LEAF_TYPES,
  requirementEditorDefaultValue,
  type PrerequisiteEditorValue,
  type RequirementGroupForm,
  type RequirementLeafDraftForm,
  type RequirementLeafForm,
  type RequirementLeafTypedForm,
} from './requirement-editor-form-schema'

type EditableRequirementLeaf = Exclude<
  RequirementExpression,
  { kind: 'all' } | { kind: 'any' } | { kind: 'classLevel' } | { kind: 'feature' }
>

export function isSupportedEditorLeaf(
  expr: RequirementExpression,
): expr is EditableRequirementLeaf {
  return expr.kind === 'minLevel' || expr.kind === 'abilityMinimum' || expr.kind === 'spellcasting'
}

export function leafFromExpression(expr: EditableRequirementLeaf): RequirementLeafForm {
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

export function groupFromAny(
  expr: Extract<RequirementExpression, { kind: 'any' }>,
): RequirementGroupForm {
  return {
    id: newRequirementGroupId(),
    kind: 'any',
    requirements: expr.requirements
      .filter(isSupportedEditorLeaf)
      .map((req) => leafFromExpression(req)),
  }
}

export function groupFromAllLeaves(leaves: RequirementLeafForm[]): RequirementGroupForm {
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

export function isRequirementLeafDraft(leaf: unknown): leaf is RequirementLeafDraftForm {
  if (!leaf || typeof leaf !== 'object') return false
  return !('type' in leaf)
}

export function isRequirementLeafForm(leaf: unknown): leaf is RequirementLeafTypedForm {
  if (!leaf || typeof leaf !== 'object') return false
  return REQUIREMENT_LEAF_TYPES.includes((leaf as RequirementLeafTypedForm).type)
}

export function isRequirementLeafRow(leaf: unknown): leaf is RequirementLeafForm {
  return isRequirementLeafDraft(leaf) || isRequirementLeafForm(leaf)
}

export function isRequirementGroupForm(group: unknown): group is RequirementGroupForm {
  if (!group || typeof group !== 'object') return false
  const record = group as RequirementGroupForm
  return (record.kind === 'all' || record.kind === 'any') && Array.isArray(record.requirements)
}

/** Drops transient holes from react-hook-form field arrays before serialization. */
export function normalizeEditorValue(
  value: PrerequisiteEditorValue | undefined,
): PrerequisiteEditorValue {
  return {
    groups: (value?.groups ?? []).filter(isRequirementGroupForm).map((group) => ({
      ...group,
      requirements: group.requirements.filter(isRequirementLeafRow),
    })),
  }
}

export function leafToExpression(
  leaf: RequirementLeafTypedForm,
  maxLevel: number,
): RequirementExpression {
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

export function requirementEditorToPreviewExpression(
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
