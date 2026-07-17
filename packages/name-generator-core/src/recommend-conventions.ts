import type {
  NamingContext,
  NamingConvention,
  NamingRecommendation,
  NamingRecommendationReason,
} from '@rpg/contracts/name-generator'

import { scoreAssociation, SUBJECT_KIND_WEIGHT, TAG_WEIGHT } from './score-association'

// ---------------------------------------------------------------------------
// Score conventions against a naming context — pure, no record lookups.
// ---------------------------------------------------------------------------

function scoreConvention(
  convention: NamingConvention,
  context: NamingContext,
): NamingRecommendation {
  const reasons: NamingRecommendationReason[] = []
  let score = 0

  if (convention.subjectKinds.includes(context.subjectKind)) {
    score += SUBJECT_KIND_WEIGHT
    reasons.push({ kind: 'subjectKind', subjectKind: context.subjectKind })
  }

  for (const association of convention.associations) {
    score += scoreAssociation(association, context, reasons)
  }

  if (context.tags !== undefined && convention.tags !== undefined) {
    for (const tag of context.tags) {
      if (convention.tags.includes(tag)) {
        score += TAG_WEIGHT
        reasons.push({ kind: 'tag', tag })
      }
    }
  }

  return {
    conventionId: convention.id,
    score,
    reasons,
  }
}

export function recommendConventions(
  context: NamingContext,
  conventions: readonly NamingConvention[],
): NamingRecommendation[] {
  return conventions
    .map((convention) => scoreConvention(convention, context))
    .filter((recommendation) => recommendation.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }
      return left.conventionId.localeCompare(right.conventionId)
    })
}
