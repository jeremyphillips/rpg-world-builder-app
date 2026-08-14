import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
import { organizationMemberTitleEntries } from './organization-member-title-entry'
import type { VocabularyTerm } from './types'

export const ORGANIZATION_DOMAIN_TERM = {
  label: 'Organization Domain',
  description: 'The primary institutional or social sphere in which an organization operates.',
  sentence: {
    singular: 'organization domain',
    plural: 'organization domains',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_DOMAIN_ENTRIES = {
  government: {
    label: 'Government',
    description: 'Exercises public governing, administrative, legislative, or judicial authority.',
    searchTerms: ['administration', 'governance', 'public authority'],
    memberTitles: organizationMemberTitleEntries(
      'Ruler',
      'Minister',
      'Councillor',
      'Magistrate',
      'Official',
    ),
  },
  political: {
    label: 'Political',
    description: 'Organizes political influence, representation, advocacy, or change.',
    searchTerms: ['advocacy', 'campaigning', 'representation'],
    memberTitles: organizationMemberTitleEntries(
      'Faction Leader',
      'Representative',
      'Delegate',
      'Organizer',
      'Member',
    ),
  },
  religious: {
    label: 'Religious',
    description: 'Centers faith, worship, ministry, doctrine, or sacred stewardship.',
    searchTerms: ['faith', 'sacred'],
    memberTitles: organizationMemberTitleEntries(
      'High Priest',
      'Priest',
      'Deacon',
      'Acolyte',
      'Initiate',
    ),
  },
  military: {
    label: 'Military',
    description: 'Organized primarily for armed command, defense, or warfare.',
    searchTerms: ['armed forces', 'defense', 'warfare'],
    memberTitles: organizationMemberTitleEntries(
      'Commander',
      'Captain',
      'Officer',
      'Soldier',
      'Recruit',
    ),
  },
  criminal: {
    label: 'Criminal',
    description: 'Organized primarily around illicit enterprise or activity.',
    searchTerms: ['illicit', 'underworld'],
    memberTitles: organizationMemberTitleEntries(
      'Boss',
      'Lieutenant',
      'Enforcer',
      'Operative',
      'Associate',
    ),
  },
  commercial: {
    label: 'Commercial',
    description: 'Produces, trades, finances, or operates for economic exchange.',
    searchTerms: ['business', 'commerce', 'enterprise'],
    memberTitles: organizationMemberTitleEntries(
      'Proprietor',
      'Partner',
      'Manager',
      'Agent',
      'Employee',
    ),
  },
  occupational: {
    label: 'Occupational',
    description: 'Serves, regulates, represents, or develops a trade or professional community.',
    aliases: ['professional'],
    searchTerms: ['craft', 'labor', 'trade', 'vocational'],
    memberTitles: organizationMemberTitleEntries(
      'Guildmaster',
      'Master',
      'Journeyman',
      'Apprentice',
      'Member',
    ),
  },
  academic: {
    label: 'Academic',
    description: 'Centers education, research, scholarship, or knowledge stewardship.',
    searchTerms: ['education', 'knowledge', 'research', 'scholarship'],
    memberTitles: organizationMemberTitleEntries(
      'Rector',
      'Professor',
      'Scholar',
      'Fellow',
      'Student',
    ),
  },
  community: {
    label: 'Community',
    description: 'Organizes kinship, locality, mutual aid, civic participation, or fellowship.',
    searchTerms: ['civic', 'local', 'mutual aid', 'social'],
    memberTitles: organizationMemberTitleEntries(
      'Elder',
      'Steward',
      'Organizer',
      'Member',
      'Volunteer',
    ),
  },
  other: {
    label: 'Other',
    description: 'An organization with no useful established domain match.',
    memberTitles: organizationMemberTitleEntries(
      'Leader',
      'Officer',
      'Senior Member',
      'Member',
      'Initiate',
    ),
  },
} as const satisfies Record<string, OrganizationClassificationEntry>

export type OrganizationDomain = keyof typeof ORGANIZATION_DOMAIN_ENTRIES

export const ORGANIZATION_DOMAIN_IDS = keysFromEntries(ORGANIZATION_DOMAIN_ENTRIES)

export const organizationDomainSchema = vocabEnumFromEntries(ORGANIZATION_DOMAIN_ENTRIES)

export function getOrganizationDomainEntry(
  id: string,
): OrganizationClassificationEntry | undefined {
  return ORGANIZATION_DOMAIN_ENTRIES[id as OrganizationDomain]
}

export function getOrganizationDomainLabel(id: string): string {
  return getOrganizationDomainEntry(id)?.label ?? id
}

export function getOrganizationDomainDiscoveryTerms(id: string): readonly string[] {
  const entry = getOrganizationDomainEntry(id)
  return entry ? getOrganizationClassificationDiscoveryTerms(entry) : []
}
