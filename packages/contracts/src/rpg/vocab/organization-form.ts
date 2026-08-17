import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
import type { VocabularyTerm } from './types'

export const ORGANIZATION_FORM_TERM = {
  label: 'Organization Form',
  description:
    'How an organization is constituted independently of its domain, functions, and practices.',
  sentence: {
    singular: 'organization form',
    plural: 'organization forms',
  },
} as const satisfies VocabularyTerm

export const ORGANIZATION_FORM_ENTRIES = {
  association: {
    label: 'Association',
    description: 'A membership body organized around a shared purpose or constituency.',
    searchTerms: ['membership organization'],
  },
  congregation: {
    label: 'Congregation',
    description: 'A gathered membership body organized around shared religious practice.',
    searchTerms: ['faith community'],
  },
  company: {
    label: 'Company',
    description: 'An organization constituted as an operating enterprise.',
    searchTerms: ['business', 'enterprise'],
  },
  cooperative: {
    label: 'Cooperative',
    description: 'An organization jointly owned or governed by participating members.',
    aliases: ['co-op'],
  },
  guild: {
    label: 'Guild',
    description: 'A membership body organized to govern or support a shared practice or trade.',
    searchTerms: ['brotherhood', 'trade body'],
  },
  network: {
    label: 'Network',
    description: 'A distributed organization coordinated through connected participants or cells.',
    searchTerms: ['ring', 'syndicate'],
  },
  order: {
    label: 'Order',
    description: 'A structured membership body organized around a rule, calling, or discipline.',
    searchTerms: ['brotherhood', 'society'],
  },
  force: {
    label: 'Force',
    description:
      'An organization constituted as an armed, levied, or crewed host rather than as a membership body or an operating enterprise.',
    searchTerms: ['host', 'corps', 'levy'],
  },
  office: {
    label: 'Office',
    description:
      'An appointed or statutory institution that exercises authority or performs an official function, rather than a voluntary membership body.',
    searchTerms: ['department', 'bureau'],
  },
} as const satisfies Record<string, OrganizationClassificationEntry>

export type OrganizationForm = keyof typeof ORGANIZATION_FORM_ENTRIES

export const ORGANIZATION_FORM_IDS = keysFromEntries(ORGANIZATION_FORM_ENTRIES)

export const organizationFormSchema = vocabEnumFromEntries(ORGANIZATION_FORM_ENTRIES)

export function getOrganizationFormEntry(id: string): OrganizationClassificationEntry | undefined {
  return ORGANIZATION_FORM_ENTRIES[id as OrganizationForm]
}

export function getOrganizationFormLabel(id: string): string {
  return getOrganizationFormEntry(id)?.label ?? id
}

export function getOrganizationFormDiscoveryTerms(id: string): readonly string[] {
  const entry = getOrganizationFormEntry(id)
  return entry ? getOrganizationClassificationDiscoveryTerms(entry) : []
}
