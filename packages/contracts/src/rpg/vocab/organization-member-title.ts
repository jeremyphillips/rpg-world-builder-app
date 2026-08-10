import type { OrganizationKind } from './organization-kind'
import {
  type OrganizationMemberTitleEntry,
  organizationMemberTitleEntries,
} from './organization-member-title-entry'
import {
  getOrganizationSubtypeEntry,
  isOrganizationSubtypeValidForKind,
} from './organization-subtype'

export type { OrganizationMemberTitleEntry } from './organization-member-title-entry'
export {
  ORGANIZATION_MEMBER_TITLE_PRIORITIES,
  organizationMemberTitleEntries,
} from './organization-member-title-entry'

/** Kind-level member-title defaults when an organization has no (compatible) subtype. */
export const ORGANIZATION_MEMBER_TITLE_DEFAULTS = {
  government: organizationMemberTitleEntries(
    'Ruler',
    'Minister',
    'Councillor',
    'Magistrate',
    'Official',
  ),
  political: organizationMemberTitleEntries(
    'Faction Leader',
    'Representative',
    'Delegate',
    'Organizer',
    'Member',
  ),
  religious: organizationMemberTitleEntries(
    'High Priest',
    'Priest',
    'Deacon',
    'Acolyte',
    'Initiate',
  ),
  military: organizationMemberTitleEntries('Commander', 'Captain', 'Officer', 'Soldier', 'Recruit'),
  criminal: organizationMemberTitleEntries(
    'Boss',
    'Lieutenant',
    'Enforcer',
    'Operative',
    'Associate',
  ),
  commercial: organizationMemberTitleEntries(
    'Proprietor',
    'Partner',
    'Manager',
    'Agent',
    'Employee',
  ),
  professional: organizationMemberTitleEntries(
    'Guildmaster',
    'Master',
    'Journeyman',
    'Apprentice',
    'Member',
  ),
  academic: organizationMemberTitleEntries('Rector', 'Professor', 'Scholar', 'Fellow', 'Student'),
  community: organizationMemberTitleEntries('Elder', 'Steward', 'Organizer', 'Member', 'Volunteer'),
  other: organizationMemberTitleEntries('Leader', 'Officer', 'Senior Member', 'Member', 'Initiate'),
} as const satisfies Record<
  OrganizationKind,
  readonly [
    OrganizationMemberTitleEntry,
    OrganizationMemberTitleEntry,
    OrganizationMemberTitleEntry,
    OrganizationMemberTitleEntry,
    OrganizationMemberTitleEntry,
  ]
>

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
}): readonly [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]] {
  const { kind, subtype } = input
  if (subtype !== undefined && isOrganizationSubtypeValidForKind(kind, subtype)) {
    const entry = getOrganizationSubtypeEntry(kind, subtype)
    if (entry) return entry.memberTitles
  }
  return ORGANIZATION_MEMBER_TITLE_DEFAULTS[kind]
}

/**
 * Exact-label lookup against the same suggestion source as
 * `resolveOrganizationMemberTitleSuggestions` — suggestions and lookup cannot diverge.
 */
export function resolveOrganizationMemberTitleEntry(input: {
  kind: OrganizationKind
  subtype?: string
  title: string
}): OrganizationMemberTitleEntry | undefined {
  const normalized = input.title.trim()
  if (normalized === '') return undefined
  return resolveOrganizationMemberTitleSuggestions({
    kind: input.kind,
    subtype: input.subtype,
  }).find((entry) => entry.label === normalized)
}
