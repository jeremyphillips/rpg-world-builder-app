import type { OrganizationFunction } from './organization-function'
import type { OrganizationPractice } from './organization-practice'

/**
 * Partition keys for the functions/practices split — not a claim that every id was
 * historically persisted as `activities`.
 */
export const ORGANIZATION_ACTIVITY_PARTITION_IDS = [
  'blacksmithing',
  'brewing',
  'worship',
  'ministry',
  'warfare',
  'defense',
  'banking',
  'finance',
  'education',
  'training',
  'research',
  'standards',
  'apprenticeship',
  'smuggling',
  'trade',
  'production',
  'transport',
  'administration',
  'extortion',
  'governance',
  'advocacy',
  'policing',
  'care',
  'stewardship',
  'intelligence',
  'aid',
] as const

export type OrganizationActivityPartitionId = (typeof ORGANIZATION_ACTIVITY_PARTITION_IDS)[number]

type OrganizationActivityMigrationTarget =
  | { readonly kind: 'function'; readonly id: OrganizationFunction }
  | { readonly kind: 'practice'; readonly id: OrganizationPractice }

export const ORGANIZATION_ACTIVITY_MIGRATION = {
  trade: { kind: 'function', id: 'trade' },
  production: { kind: 'function', id: 'production' },
  transport: { kind: 'function', id: 'transport' },
  administration: { kind: 'function', id: 'administration' },
  warfare: { kind: 'function', id: 'warfare' },
  defense: { kind: 'function', id: 'defense' },
  education: { kind: 'function', id: 'education' },
  training: { kind: 'function', id: 'training' },
  research: { kind: 'function', id: 'research' },
  finance: { kind: 'function', id: 'finance' },
  worship: { kind: 'function', id: 'worship' },
  ministry: { kind: 'function', id: 'ministry' },
  standards: { kind: 'function', id: 'standards' },
  governance: { kind: 'function', id: 'governance' },
  advocacy: { kind: 'function', id: 'advocacy' },
  policing: { kind: 'function', id: 'policing' },
  care: { kind: 'function', id: 'care' },
  aid: { kind: 'function', id: 'aid' },
  stewardship: { kind: 'function', id: 'stewardship' },
  intelligence: { kind: 'function', id: 'intelligence' },
  blacksmithing: { kind: 'practice', id: 'blacksmithing' },
  brewing: { kind: 'practice', id: 'brewing' },
  banking: { kind: 'practice', id: 'banking' },
  apprenticeship: { kind: 'practice', id: 'apprenticeship' },
  smuggling: { kind: 'practice', id: 'smuggling' },
  extortion: { kind: 'practice', id: 'extortion' },
} as const satisfies Record<OrganizationActivityPartitionId, OrganizationActivityMigrationTarget>

export function migrateOrganizationActivities(
  activities: readonly OrganizationActivityPartitionId[],
): {
  functions: OrganizationFunction[]
  practices: OrganizationPractice[]
} {
  const functions: OrganizationFunction[] = []
  const practices: OrganizationPractice[] = []
  const seen = new Set<OrganizationActivityPartitionId>()

  for (const activity of activities) {
    if (seen.has(activity)) continue
    seen.add(activity)

    const target = ORGANIZATION_ACTIVITY_MIGRATION[activity]
    if (target.kind === 'function') {
      functions.push(target.id)
    } else {
      practices.push(target.id)
    }
  }

  return { functions, practices }
}
