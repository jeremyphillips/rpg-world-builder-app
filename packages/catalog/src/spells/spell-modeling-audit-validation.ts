import {
  contentModelingSchema,
  isExplicitModelingStatus,
  isSpellModelingCapabilityId,
  isSpellModelingGapCode,
  validateSpellModelingPromotion,
  type Spell,
} from '@rpg/contracts'

import type { SpellModelingViolation } from './spell-modeling-audit'

function toViolation(slug: string, code: string, message: string): SpellModelingViolation {
  return { slug, code, message }
}

function validateModelingCapabilityId(
  slug: string,
  capabilityId: string | undefined,
  path: string,
): SpellModelingViolation[] {
  if (!capabilityId || isSpellModelingCapabilityId(capabilityId)) {
    return []
  }
  return [
    toViolation(
      slug,
      'unknown-capability-id',
      `Unknown spell modeling capability id at ${path}: ${capabilityId}`,
    ),
  ]
}

function validateParsedModeling(spell: Spell): SpellModelingViolation[] {
  const parsed = contentModelingSchema.safeParse(spell.modeling)
  if (!parsed.success) {
    return parsed.error.issues.map((issue) =>
      toViolation(spell.slug, 'invalid-modeling-schema', issue.message),
    )
  }

  const modeling = parsed.data
  const violations: SpellModelingViolation[] = []

  if (modeling.status && !isExplicitModelingStatus(modeling.status)) {
    violations.push(
      toViolation(
        spell.slug,
        'invalid-explicit-status',
        'Status must be one of: meaningful-partial, sufficient-for-display, sufficient-for-character-sheet, mechanics-ready',
      ),
    )
  }

  if (modeling.blocker && !isSpellModelingGapCode(modeling.blocker.code)) {
    violations.push(
      toViolation(
        spell.slug,
        'unknown-gap-code',
        `Unknown modeling blocker code: ${modeling.blocker.code}`,
      ),
    )
  }

  violations.push(
    ...validateModelingCapabilityId(spell.slug, modeling.blocker?.capabilityId, 'modeling.blocker'),
  )

  for (const gap of modeling.gaps ?? []) {
    if (!isSpellModelingGapCode(gap.code)) {
      violations.push(
        toViolation(spell.slug, 'unknown-gap-code', `Unknown modeling gap code: ${gap.code}`),
      )
    }
    violations.push(
      ...validateModelingCapabilityId(spell.slug, gap.capabilityId, `modeling.gaps.${gap.code}`),
    )
  }

  for (const issue of validateSpellModelingPromotion(spell)) {
    violations.push(toViolation(spell.slug, issue.code, issue.message))
  }

  return violations
}

/** Validates modeling metadata shape and consistency for one spell. */
export function validateSpellModelingConsistency(spell: Spell): SpellModelingViolation[] {
  if (!spell.modeling) return []
  return validateParsedModeling(spell)
}
