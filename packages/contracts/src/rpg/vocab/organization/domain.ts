import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { OrganizationClassificationEntry } from './classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './classification-entry'
import type { VocabularyTerm } from '../types'

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
  },
  political: {
    label: 'Political',
    description: 'Organizes political influence, representation, advocacy, or change.',
    searchTerms: ['advocacy', 'campaigning', 'representation'],
  },
  religious: {
    label: 'Religious',
    description: 'Centers faith, worship, ministry, doctrine, or sacred stewardship.',
    searchTerms: ['faith', 'sacred'],
  },
  military: {
    label: 'Military',
    description: 'Organized primarily for armed command, defense, or warfare.',
    searchTerms: ['armed forces', 'defense', 'warfare'],
  },
  criminal: {
    label: 'Criminal',
    description: 'Organized primarily around illicit enterprise or activity.',
    searchTerms: ['illicit', 'underworld'],
  },
  commercial: {
    label: 'Commercial',
    description: 'Produces, trades, finances, or operates for economic exchange.',
    searchTerms: ['business', 'commerce', 'enterprise'],
  },
  occupational: {
    label: 'Occupational',
    description: 'Serves, regulates, represents, or develops a trade or professional community.',
    aliases: ['professional'],
    searchTerms: ['craft', 'labor', 'trade', 'vocational'],
  },
  academic: {
    label: 'Academic',
    description: 'Centers education, research, scholarship, or knowledge stewardship.',
    searchTerms: ['education', 'knowledge', 'research', 'scholarship'],
  },
  community: {
    label: 'Community',
    description: 'Organizes kinship, locality, mutual aid, civic participation, or fellowship.',
    searchTerms: ['civic', 'local', 'mutual aid', 'social'],
  },
  other: {
    label: 'Other',
    description: 'An organization with no useful established domain match.',
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
