import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
import { organizationMemberTitleEntries } from './organization-member-title-entry'
import type { VocabularyTerm } from './types'

export const ORGANIZATION_PRACTICE_TERM = {
  label: 'Organization Practice',
  description:
    'Curated specialized trades, methods, specialties, or operational techniques. Narrower than Functions, still closed vocabulary — not free-text, not a job-title dump, not one-off actions.',
  sentence: {
    singular: 'organization practice',
    plural: 'organization practices',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_PRACTICE_ENTRIES = {
  blacksmithing: {
    label: 'Blacksmithing',
    description: 'Forging, shaping, and repairing iron or steel goods.',
    searchTerms: ['forge', 'smithing'],
    memberTitles: organizationMemberTitleEntries(
      'Master Smith',
      'Blacksmith',
      'Journeyman',
      'Apprentice',
      'Worker',
    ),
  },
  brewing: {
    label: 'Brewing',
    description: 'Producing beer, ale, or other brewed beverages.',
    searchTerms: ['ale', 'beer'],
    memberTitles: organizationMemberTitleEntries(
      'Master Brewer',
      'Brewer',
      'Cellarer',
      'Apprentice',
      'Worker',
    ),
  },
  banking: {
    label: 'Banking',
    description: 'Holding, lending, transferring, or safeguarding money and valuables.',
    searchTerms: ['bank', 'credit', 'lending'],
    memberTitles: organizationMemberTitleEntries(
      'Treasurer',
      'Banker',
      'Cashier',
      'Clerk',
      'Agent',
    ),
  },
  apprenticeship: {
    label: 'Apprenticeship',
    description: 'Developing practitioners through supervised occupational learning.',
    searchTerms: ['mentorship', 'vocational learning'],
    memberTitles: organizationMemberTitleEntries(
      'Mentor',
      'Trainer',
      'Journeyman',
      'Learner',
      'Novice',
    ),
  },
  smuggling: {
    label: 'Smuggling',
    description: 'Moving restricted or illicit goods, people, or information covertly.',
    searchTerms: ['contraband', 'illicit transport'],
    memberTitles: organizationMemberTitleEntries(
      'Ringleader',
      'Smuggler',
      'Courier',
      'Lookout',
      'Fence',
    ),
  },
  extortion: {
    label: 'Extortion',
    description:
      'Obtaining money, property, compliance, or advantage through threats, coercion, or intimidation as a sustained organizational practice.',
    searchTerms: ['coercion', 'intimidation', 'protection racket'],
    memberTitles: organizationMemberTitleEntries(
      'Chief',
      'Enforcer',
      'Collector',
      'Lieutenant',
      'Operative',
    ),
  },
} as const satisfies Record<string, OrganizationClassificationEntry>

export type OrganizationPractice = keyof typeof ORGANIZATION_PRACTICE_ENTRIES

export const ORGANIZATION_PRACTICE_IDS = keysFromEntries(ORGANIZATION_PRACTICE_ENTRIES)

export const organizationPracticeSchema = vocabEnumFromEntries(ORGANIZATION_PRACTICE_ENTRIES)

export function getOrganizationPracticeEntry(
  id: string,
): OrganizationClassificationEntry | undefined {
  return ORGANIZATION_PRACTICE_ENTRIES[id as OrganizationPractice]
}

export function getOrganizationPracticeLabel(id: string): string {
  return getOrganizationPracticeEntry(id)?.label ?? id
}

export function getOrganizationPracticeDiscoveryTerms(id: string): readonly string[] {
  const entry = getOrganizationPracticeEntry(id)
  return entry ? getOrganizationClassificationDiscoveryTerms(entry) : []
}
