import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import { defineMessage } from '../../../../validation/define-message'
import { creatureSizeSchema } from '../../../vocab/creature-size'
import { creatureTypeSchema } from '../../../vocab/creature-type'
import { effectConditionSchema } from '../../../vocab/effect-condition'
import type { ResolutionTargetKind } from '../../../vocab/resolution'

import {
  collectRequirementListIssues,
  getRequirementTargetIncompatibility,
  readRequirementCompatibilityInput,
  type RequirementListIssueCode,
} from './requirement-target-compatibility'
import { formatRequirementTargetIncompatibilityMessage } from './requirement-target-messages'

/**
 * Who may be chosen. Rows combine with AND. Values inside one row do not:
 *
 * - creature-type include — any listed type
 * - creature-type exclude — none of the listed types
 * - condition has — at least one listed condition
 * - condition lacks — none of the listed conditions
 * - any-of — willing, or at least one listed condition
 *
 * At most one row of each kind. `any-of` is the only disjunction, and it cannot
 * sit beside a willing row or a condition row. Creature-specific rows are valid
 * only when the target kind is `creature`. `written.text` is a full qualifying
 * clause (`that is a demon`), not a bare noun. Nothing here is checked in play.
 */
export const resolutionTargetRequirementValidationMessages = {
  duplicateKind: defineMessage(
    'validation.resolutionTarget.duplicateRequirementKind',
    () => 'This requirement is already added.',
  ),
  willingWithAnyOf: defineMessage(
    'validation.resolutionTarget.willingWithAnyOf',
    () => 'Willing is already included in "willing or has a condition." Remove one of them.',
  ),
  conditionWithAnyOf: defineMessage(
    'validation.resolutionTarget.conditionWithAnyOf',
    () =>
      'Remove the condition requirement or "willing or has a condition." They can\'t be combined.',
  ),
  creatureOnly: defineMessage(
    'validation.resolutionTarget.creatureOnlyRequirement',
    () => 'This requirement applies to creatures. Choose Creature, or remove it.',
  ),
  duplicateIds: defineMessage(
    'validation.resolutionTarget.duplicateRequirementIds',
    () => 'Remove duplicate entries.',
  ),
  anyOfEmpty: defineMessage(
    'validation.resolutionTarget.anyOfEmpty',
    () => 'Add willing or at least one condition.',
  ),
  writtenClause: defineMessage(
    'validation.resolutionTarget.writtenClause',
    () => 'Write a qualifying clause, such as "that is a demon."',
  ),
} as const

const sightRequirementSchema = z
  .object({
    kind: z.literal('sight'),
    who: z.enum(['actor', 'target', 'both']),
  })
  .strict()

const sizeRequirementSchema = z
  .object({
    kind: z.literal('size'),
    bound: creatureSizeSchema,
    comparison: z.enum(['or-smaller', 'or-larger', 'only']),
  })
  .strict()

const creatureTypeRequirementSchema = z
  .object({
    kind: z.literal('creature-type'),
    mode: z.enum(['include', 'exclude']),
    ids: z.array(creatureTypeSchema).min(1),
  })
  .strict()
  .superRefine((row, ctx) => {
    refineUniqueIds(row.ids, ctx, ['ids'])
  })

const conditionRequirementSchema = z
  .object({
    kind: z.literal('condition'),
    presence: z.enum(['has', 'lacks']),
    ids: z.array(effectConditionSchema).min(1),
  })
  .strict()
  .superRefine((row, ctx) => {
    refineUniqueIds(row.ids, ctx, ['ids'])
  })

const willingRequirementSchema = z
  .object({
    kind: z.literal('willing'),
  })
  .strict()

const anyOfRequirementSchema = z
  .object({
    kind: z.literal('any-of'),
    willing: z.boolean().optional(),
    conditionIds: z.array(effectConditionSchema).optional(),
  })
  .strict()
  .superRefine((row, ctx) => {
    const ids = row.conditionIds ?? []
    refineUniqueIds(ids, ctx, ['conditionIds'])
    if (row.willing === true || ids.length > 0) return
    addCustomRefinementIssue(ctx, resolutionTargetRequirementValidationMessages.anyOfEmpty(), [
      'conditionIds',
    ])
  })

const writtenRequirementSchema = z
  .object({
    kind: z.literal('written'),
    text: z.string(),
  })
  .strict()
  .superRefine((row, ctx) => {
    const text = row.text.trim()
    if (text.length > 0 && /\s/.test(text)) return
    addCustomRefinementIssue(ctx, resolutionTargetRequirementValidationMessages.writtenClause(), [
      'text',
    ])
  })

export const resolutionTargetRequirementSchema = z.discriminatedUnion('kind', [
  sightRequirementSchema,
  sizeRequirementSchema,
  creatureTypeRequirementSchema,
  conditionRequirementSchema,
  willingRequirementSchema,
  anyOfRequirementSchema,
  writtenRequirementSchema,
])

export type ResolutionTargetRequirement = z.infer<typeof resolutionTargetRequirementSchema>

export const resolutionTargetRequirementsSchema = z
  .array(resolutionTargetRequirementSchema)
  .superRefine(refineRequirementList)

function refineUniqueIds(ids: readonly string[], ctx: z.RefinementCtx, path: PropertyKey[]): void {
  if (new Set(ids).size === ids.length) return
  addCustomRefinementIssue(ctx, resolutionTargetRequirementValidationMessages.duplicateIds(), path)
}

function listIssueMessage(code: RequirementListIssueCode): string {
  switch (code) {
    case 'duplicate-kind':
      return resolutionTargetRequirementValidationMessages.duplicateKind()
    case 'willing-with-any-of':
      return resolutionTargetRequirementValidationMessages.willingWithAnyOf()
    case 'condition-with-any-of':
      return resolutionTargetRequirementValidationMessages.conditionWithAnyOf()
    default: {
      const _exhaustive: never = code
      return _exhaustive
    }
  }
}

function refineRequirementList(
  rows: readonly ResolutionTargetRequirement[],
  ctx: z.RefinementCtx,
): void {
  for (const issue of collectRequirementListIssues(rows)) {
    addCustomRefinementIssue(ctx, listIssueMessage(issue.code), [issue.index])
  }
}

function refinementMessageForRow(
  row: ResolutionTargetRequirement,
  targetKind: ResolutionTargetKind,
): string | undefined {
  const input = readRequirementCompatibilityInput(row)
  if (!input) return undefined
  const incompatibility = getRequirementTargetIncompatibility(input, targetKind)
  if (!incompatibility) return undefined
  return formatRequirementTargetIncompatibilityMessage(incompatibility, 'validation')
}

/** Incompatible rows stay stored when the kind changes; publish rejects them. */
export function refineRequirementsForTargetKind(
  kind: ResolutionTargetKind | undefined,
  requirements: readonly ResolutionTargetRequirement[] | undefined,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = ['requirements'],
): void {
  if (!kind || !requirements) return
  requirements.forEach((row, index) => {
    const message = refinementMessageForRow(row, kind)
    if (!message) return
    addCustomRefinementIssue(ctx, message, [...pathPrefix, index])
  })
}
