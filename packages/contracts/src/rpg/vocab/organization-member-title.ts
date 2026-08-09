import type { OrganizationKind } from './organization-kind'
import {
  getOrganizationSubtypeEntry,
  isOrganizationSubtypeValidForKind,
} from './organization-subtype'

/** Kind-level member-title defaults when an organization has no (compatible) subtype. */
export const ORGANIZATION_MEMBER_TITLE_DEFAULTS = {
  government: ['Ruler', 'Minister', 'Councillor', 'Magistrate', 'Official'],
  political: ['Faction Leader', 'Representative', 'Delegate', 'Organizer', 'Member'],
  religious: ['High Priest', 'Priest', 'Deacon', 'Acolyte', 'Initiate'],
  military: ['Commander', 'Captain', 'Officer', 'Soldier', 'Recruit'],
  criminal: ['Boss', 'Lieutenant', 'Enforcer', 'Operative', 'Associate'],
  commercial: ['Proprietor', 'Partner', 'Manager', 'Agent', 'Employee'],
  professional: ['Guildmaster', 'Master', 'Journeyman', 'Apprentice', 'Member'],
  academic: ['Rector', 'Professor', 'Scholar', 'Fellow', 'Student'],
  community: ['Elder', 'Steward', 'Organizer', 'Member', 'Volunteer'],
  other: ['Leader', 'Officer', 'Senior Member', 'Member', 'Initiate'],
} as const satisfies Record<OrganizationKind, readonly [string, ...string[]]>

/**
 * Resolves ordered member-title suggestions for an organization classification.
 *
 * - Valid kind+subtype pair → that subtype's `memberTitles`
 * - Subtype absent → kind defaults
 * - Subtype incompatible with kind → kind defaults (never wrong-kind titles)
 */
export function resolveOrganizationMemberTitleSuggestions(input: {
  kind: OrganizationKind
  subtype?: string
}): readonly [string, ...string[]] {
  const { kind, subtype } = input
  if (subtype !== undefined && isOrganizationSubtypeValidForKind(kind, subtype)) {
    const entry = getOrganizationSubtypeEntry(kind, subtype)
    if (entry) return entry.memberTitles
  }
  return ORGANIZATION_MEMBER_TITLE_DEFAULTS[kind]
}
