import type { ContentModeling } from '../../../primitives/modeling/schema'
import { meetsConsumerThreshold, meetsModelingThreshold } from '../../../primitives/modeling/status'
import { formatResolutionSummarySections } from '../resolution/format-summary'
import { spellResolutionSchema, type SpellResolution } from '../resolution/schema'

export type SpellModelingValidationIssue = {
  code: string
  message: string
}

/** Schema parse + JSON re-parse identity — contracts-level round-trip without form coupling. */
export function validateSpellResolutionSchemaRoundTrip(
  resolution: unknown,
): SpellModelingValidationIssue[] {
  const issues: SpellModelingValidationIssue[] = []

  const parsed = spellResolutionSchema.safeParse(resolution)
  if (!parsed.success) {
    issues.push({
      code: 'invalid-resolution-schema',
      message: parsed.error.issues[0]?.message ?? 'Resolution failed schema validation',
    })
    return issues
  }

  const serialized = JSON.parse(JSON.stringify(parsed.data)) as SpellResolution
  const reparsed = spellResolutionSchema.safeParse(serialized)
  if (!reparsed.success) {
    issues.push({
      code: 'resolution-round-trip-failed',
      message: 'Resolution failed schema validation after JSON round-trip',
    })
  }

  return issues
}

export function validateSpellResolutionDisplayReady(
  resolution: SpellResolution,
): SpellModelingValidationIssue[] {
  try {
    const sections = formatResolutionSummarySections(resolution)
    if (sections.length === 0) {
      return [
        { code: 'empty-display-sections', message: 'Resolution produced no display sections' },
      ]
    }
    return []
  } catch (error) {
    return [
      {
        code: 'display-formatter-failed',
        message: error instanceof Error ? error.message : 'Display formatter threw',
      },
    ]
  }
}

/**
 * Validates that a spell's explicit modeling status is consistent with its resolution envelope.
 * Dashboard form round-trip is enforced at promotion time by reviewers and future editor tests.
 */
export function validateSpellModelingPromotion(spell: {
  modeling?: ContentModeling | null
  resolution?: SpellResolution | null
}): SpellModelingValidationIssue[] {
  const status = spell.modeling?.status
  if (!status) return []

  const issues: SpellModelingValidationIssue[] = []

  if (meetsModelingThreshold(status, 'meaningful-partial') && !spell.resolution) {
    issues.push({
      code: 'missing-resolution',
      message: `${status} requires a structured resolution envelope`,
    })
    return issues
  }

  if (!spell.resolution) return issues

  issues.push(...validateSpellResolutionSchemaRoundTrip(spell.resolution))

  if (issues.length > 0) return issues

  if (meetsConsumerThreshold(status, 'sufficient-for-display')) {
    issues.push(...validateSpellResolutionDisplayReady(spell.resolution))
  }

  if (status === 'mechanics-ready' && spell.resolution.outcomes.length === 0) {
    issues.push({
      code: 'missing-outcomes',
      message: 'mechanics-ready requires at least one outcome branch',
    })
  }

  return issues
}

export {
  isEditorEligible,
  meetsConsumerThreshold,
  meetsModelingThreshold,
} from '../../../primitives/modeling/status'
