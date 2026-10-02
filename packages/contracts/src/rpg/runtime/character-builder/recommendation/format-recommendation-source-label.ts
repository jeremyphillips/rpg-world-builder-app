import { getContentTypeSentenceForm } from '../../../content/lib/content-type-terms'

import type { RecommendationSourceKind } from './recommendation-source-ref'

/** Canonical phrases append the kind. Suggestion densities preserve current Quick NPC copy. */
export const RECOMMENDATION_SOURCE_LABEL_DENSITIES = [
  'canonical',
  'choice-hint',
  'attribute-helper',
] as const

export type RecommendationSourceLabelDensity =
  (typeof RECOMMENDATION_SOURCE_LABEL_DENSITIES)[number]

export type FormatRecommendationSourceLabelOptions = {
  name?: string
  density?: RecommendationSourceLabelDensity
}

const CANONICAL_KIND_WORD: Record<Exclude<RecommendationSourceKind, 'user' | 'origin'>, string> = {
  class: getContentTypeSentenceForm('classes'),
  subclass: 'subclass',
  species: getContentTypeSentenceForm('species'),
  feat: getContentTypeSentenceForm('feats'),
  role: 'role',
  title: 'title',
  organization: getContentTypeSentenceForm('organizations'),
}

function canonicalLabel(kind: RecommendationSourceKind, name: string | undefined): string {
  if (kind === 'user') return 'You'
  if (kind === 'origin') return name ? `${name} origin` : 'Origin'
  const word = CANONICAL_KIND_WORD[kind]
  return name ? `${name} ${word}` : word.charAt(0).toUpperCase() + word.slice(1)
}

function choiceHintLabel(
  kind: RecommendationSourceKind,
  name: string | undefined,
): string | undefined {
  if (!name) return undefined
  if (kind === 'role') return `${name} role`
  if (kind === 'species') return `${name} ${getContentTypeSentenceForm('species')}`
  if (kind === 'class') return `${name} ${getContentTypeSentenceForm('classes')}`
  if (kind === 'title') return name
  return undefined
}

/** Formats one recommendation source. Choice-hint and attribute-helper keep today's suggestion strings. */
export function formatRecommendationSourceLabel(
  source: { kind: RecommendationSourceKind },
  options: FormatRecommendationSourceLabelOptions = {},
): string | undefined {
  const density = options.density ?? 'canonical'
  const name = options.name?.trim() || undefined

  if (density === 'attribute-helper') return name
  if (density === 'choice-hint') return choiceHintLabel(source.kind, name)
  return canonicalLabel(source.kind, name)
}
