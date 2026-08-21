import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

import type { EntitySummaryStatusItem } from '../../lib/entity/summary/entity-summary-status.types'

export interface MasterDetailListBadge {
  label: string
  appearance: BadgeAppearance
  tone: BadgeTone
}

export function mapMasterDetailBadgesToStatus(
  badges: readonly MasterDetailListBadge[],
): EntitySummaryStatusItem[] {
  return badges.map((badge) => ({
    kind: 'badge',
    label: badge.label,
    appearance: badge.appearance,
    tone: badge.tone,
  }))
}

export function buildMasterDetailRowStatus(args: {
  hasError?: boolean
  badges?: readonly MasterDetailListBadge[]
}): EntitySummaryStatusItem[] | undefined {
  const items: EntitySummaryStatusItem[] = [
    ...(args.hasError ? [{ kind: 'validationError' as const }] : []),
    ...(args.badges ? mapMasterDetailBadgesToStatus(args.badges) : []),
  ]

  return items.length > 0 ? items : undefined
}
