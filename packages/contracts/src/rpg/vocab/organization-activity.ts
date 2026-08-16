import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
import { organizationMemberTitleEntries } from './organization-member-title-entry'
import type { VocabularyTerm } from './types'

export const ORGANIZATION_ACTIVITY_TERM = {
  label: 'Organization Activity',
  description:
    'Sustained work, mission, or practice performed by an organization. New values should normally be reusable missions spanning multiple familiar types; narrow occupational activities require separate evidence.',
  sentence: {
    singular: 'organization activity',
    plural: 'organization activities',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_ACTIVITY_ENTRIES = {
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
  worship: {
    label: 'Worship',
    description: 'Conducting or supporting religious devotion and ceremony.',
    searchTerms: ['ceremony', 'devotion'],
    memberTitles: organizationMemberTitleEntries(
      'Celebrant',
      'Keeper',
      'Cantor',
      'Attendant',
      'Devotee',
    ),
  },
  ministry: {
    label: 'Ministry',
    description: 'Providing religious leadership, pastoral care, or spiritual service.',
    searchTerms: ['pastoral care'],
    memberTitles: organizationMemberTitleEntries(
      'High Priest',
      'Priest',
      'Deacon',
      'Minister',
      'Chaplain',
    ),
  },
  warfare: {
    label: 'Warfare',
    description: 'Conducting organized armed conflict or military operations.',
    searchTerms: ['combat', 'war'],
    memberTitles: organizationMemberTitleEntries(
      'General',
      'Strategist',
      'Combatant',
      'Scout',
      'Tactician',
    ),
  },
  defense: {
    label: 'Defense',
    description: 'Protecting people, territory, assets, or institutions from threats.',
    aliases: ['defence'],
    searchTerms: ['protection', 'security'],
    memberTitles: organizationMemberTitleEntries(
      'Warden',
      'Protector',
      'Sentinel',
      'Watcher',
      'Defender',
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
  finance: {
    label: 'Finance',
    description: 'Managing capital, investment, accounting, or financial exchange.',
    searchTerms: ['accounting', 'investment'],
    memberTitles: organizationMemberTitleEntries(
      'Treasurer',
      'Financier',
      'Accountant',
      'Broker',
      'Auditor',
    ),
  },
  education: {
    label: 'Education',
    description: 'Providing structured teaching or learning.',
    searchTerms: ['schooling', 'teaching'],
    memberTitles: organizationMemberTitleEntries(
      'Headmaster',
      'Instructor',
      'Tutor',
      'Teacher',
      'Pupil',
    ),
  },
  training: {
    label: 'Training',
    description: 'Developing practical knowledge, discipline, or skill through instruction.',
    searchTerms: ['instruction'],
    memberTitles: organizationMemberTitleEntries(
      'Instructor',
      'Trainer',
      'Coach',
      'Trainee',
      'Student',
    ),
  },
  research: {
    label: 'Research',
    description: 'Conducting systematic inquiry, experimentation, or scholarship.',
    searchTerms: ['inquiry', 'scholarship'],
    memberTitles: organizationMemberTitleEntries(
      'Research Director',
      'Researcher',
      'Archivist',
      'Correspondent',
      'Assistant',
    ),
  },
  standards: {
    label: 'Standards',
    description: 'Defining, assessing, or enforcing standards of occupational practice.',
    searchTerms: ['certification', 'regulation'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Assessor',
      'Assessor',
      'Examiner',
      'Practitioner',
      'Candidate',
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
  trade: {
    label: 'Trade',
    description:
      'Sustained buying, selling, or exchanging of goods or commercial services as an operating concern.',
    searchTerms: ['commerce', 'exchange', 'merchandise'],
    memberTitles: organizationMemberTitleEntries('Merchant', 'Factor', 'Trader', 'Broker', 'Clerk'),
  },
  production: {
    label: 'Production',
    description: 'Making, extracting, or processing goods at organizational scale.',
    searchTerms: ['manufacture', 'extraction', 'industry'],
    memberTitles: organizationMemberTitleEntries(
      'Foreman',
      'Artisan',
      'Operator',
      'Journeyman',
      'Worker',
    ),
  },
  transport: {
    label: 'Transport',
    description: 'Moving people, goods, or messages as a sustained service.',
    searchTerms: ['shipping', 'haulage', 'carriage'],
    memberTitles: organizationMemberTitleEntries('Master', 'Pilot', 'Driver', 'Handler', 'Porter'),
  },
  administration: {
    label: 'Administration',
    description:
      'Conducting official, bureaucratic, or institutional administration as sustained work.',
    searchTerms: ['bureaucracy', 'civil service', 'records'],
    memberTitles: organizationMemberTitleEntries(
      'Registrar',
      'Secretary',
      'Clerk',
      'Scribe',
      'Official',
    ),
  },
} as const satisfies Record<string, OrganizationClassificationEntry>

export type OrganizationActivity = keyof typeof ORGANIZATION_ACTIVITY_ENTRIES

export const ORGANIZATION_ACTIVITY_IDS = keysFromEntries(ORGANIZATION_ACTIVITY_ENTRIES)

export const organizationActivitySchema = vocabEnumFromEntries(ORGANIZATION_ACTIVITY_ENTRIES)

export function getOrganizationActivityEntry(
  id: string,
): OrganizationClassificationEntry | undefined {
  return ORGANIZATION_ACTIVITY_ENTRIES[id as OrganizationActivity]
}

export function getOrganizationActivityLabel(id: string): string {
  return getOrganizationActivityEntry(id)?.label ?? id
}

export function getOrganizationActivityDiscoveryTerms(id: string): readonly string[] {
  const entry = getOrganizationActivityEntry(id)
  return entry ? getOrganizationClassificationDiscoveryTerms(entry) : []
}
