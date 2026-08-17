import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
import { organizationMemberTitleEntries } from './organization-member-title-entry'
import type { VocabularyTerm } from './types'

export const ORGANIZATION_FUNCTION_TERM = {
  label: 'Organization Function',
  description:
    'Independently meaningful, reusable sustained work that composes across materially different organization types. Not an occupation catalog.',
  sentence: {
    singular: 'organization function',
    plural: 'organization functions',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_FUNCTION_ENTRIES = {
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
  governance: {
    label: 'Governance',
    description:
      'Exercising authority, setting binding direction, or ruling over people, territory, or institutions.',
    searchTerms: ['authority', 'rule', 'sovereignty'],
    memberTitles: organizationMemberTitleEntries(
      'Chancellor',
      'Magistrate',
      'Councilor',
      'Clerk',
      'Steward',
    ),
  },
  advocacy: {
    label: 'Advocacy',
    description: 'Campaigning, representing, or organizing for a cause, policy, or constituency.',
    searchTerms: ['campaigning', 'representation', 'lobbying'],
    memberTitles: organizationMemberTitleEntries(
      'Advocate',
      'Campaigner',
      'Organizer',
      'Spokesperson',
      'Delegate',
    ),
  },
  policing: {
    label: 'Policing',
    description:
      'Enforcing order, investigating offenses, or maintaining public safety among a population.',
    searchTerms: ['law enforcement', 'investigation', 'public order'],
    memberTitles: organizationMemberTitleEntries(
      'Captain',
      'Investigator',
      'Constable',
      'Watcher',
      'Patrol',
    ),
  },
  care: {
    label: 'Care',
    description:
      'Providing bodily, medical, or welfare care to people in need of healing or support.',
    searchTerms: ['healing', 'medical care', 'welfare'],
    memberTitles: organizationMemberTitleEntries(
      'Matron',
      'Healer',
      'Nurse',
      'Caretaker',
      'Attendant',
    ),
  },
  stewardship: {
    label: 'Stewardship',
    description:
      'Preserving, curating, or safeguarding knowledge, artifacts, sites, or cultural heritage.',
    searchTerms: ['curation', 'preservation', 'custody'],
    memberTitles: organizationMemberTitleEntries(
      'Curator',
      'Keeper',
      'Custodian',
      'Archivist',
      'Warden',
    ),
  },
  intelligence: {
    label: 'Intelligence',
    description: 'Gathering, analyzing, or acting on covert or strategic information.',
    searchTerms: ['espionage', 'surveillance', 'covert information'],
    memberTitles: organizationMemberTitleEntries(
      'Director',
      'Handler',
      'Analyst',
      'Agent',
      'Scout',
    ),
  },
  aid: {
    label: 'Aid',
    description:
      'Providing material relief, mutual assistance, or reciprocal support to communities in need.',
    searchTerms: ['relief', 'mutual aid', 'charity'],
    memberTitles: organizationMemberTitleEntries(
      'Coordinator',
      'Benefactor',
      'Volunteer',
      'Almoner',
      'Steward',
    ),
  },
} as const satisfies Record<string, OrganizationClassificationEntry>

export type OrganizationFunction = keyof typeof ORGANIZATION_FUNCTION_ENTRIES

export const ORGANIZATION_FUNCTION_IDS = keysFromEntries(ORGANIZATION_FUNCTION_ENTRIES)

export const organizationFunctionSchema = vocabEnumFromEntries(ORGANIZATION_FUNCTION_ENTRIES)

export function getOrganizationFunctionEntry(
  id: string,
): OrganizationClassificationEntry | undefined {
  return ORGANIZATION_FUNCTION_ENTRIES[id as OrganizationFunction]
}

export function getOrganizationFunctionLabel(id: string): string {
  return getOrganizationFunctionEntry(id)?.label ?? id
}

export function getOrganizationFunctionDiscoveryTerms(id: string): readonly string[] {
  const entry = getOrganizationFunctionEntry(id)
  return entry ? getOrganizationClassificationDiscoveryTerms(entry) : []
}
