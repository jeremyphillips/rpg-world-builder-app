import type { HomebrewSummaryContentType } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export type VisibleSidebarContentEntry = {
  contentType: HomebrewSummaryContentType
  /** Sidebar nav and hub card label. */
  label: string
  overview: (campaignId: string) => string
  /** Omitted when there is no single create route (e.g. equipment families). */
  create?: (campaignId: string) => string
}

/**
 * Parent content types shown in the campaign sidebar and Homebrew hub Content
 * section — keep in sync with `HOMEBREW_SUMMARY_CONTENT_TYPES` in contracts.
 */
export const VISIBLE_SIDEBAR_CONTENT: readonly VisibleSidebarContentEntry[] = [
  {
    contentType: 'classes',
    label: 'Classes',
    overview: ROUTES.content.classes.overview,
    create: ROUTES.content.classes.create,
  },
  {
    contentType: 'spells',
    label: 'Spells',
    overview: ROUTES.content.spells.overview,
    create: ROUTES.content.spells.create,
  },
  {
    contentType: 'species',
    label: 'Species',
    overview: ROUTES.content.species.overview,
    create: ROUTES.content.species.create,
  },
  {
    contentType: 'feats',
    label: 'Feats',
    overview: ROUTES.content.feats.overview,
    create: ROUTES.content.feats.create,
  },
  {
    contentType: 'equipment',
    label: 'Equipment',
    overview: ROUTES.content.equipment.hub,
  },
  {
    contentType: 'skill-proficiencies',
    label: 'Skill Proficiencies',
    overview: ROUTES.content.skillProficiencies.overview,
    create: ROUTES.content.skillProficiencies.create,
  },
]

export function findVisibleSidebarContent(
  contentType: HomebrewSummaryContentType,
): VisibleSidebarContentEntry | undefined {
  return VISIBLE_SIDEBAR_CONTENT.find((entry) => entry.contentType === contentType)
}
