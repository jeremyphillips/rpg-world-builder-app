import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry } from '../types'
import type { VocabularyTerm } from '../types'

/**
 * Canonical class slug seed — resolved to catalog class ids at recommendation time.
 * Template affinities reference baseline canonical classes only; organization affinities
 * remain the path for organization-specific or homebrew class recommendations.
 */
export type NpcAuthoringTemplateClassAffinitySlug = string

/** Reusable NPC build archetype — not a power tier or title applicability rule. */
export type NpcAuthoringTemplateEntry = GameTermEntry & {
  readonly searchTerms?: readonly string[]
  readonly classAffinityIds?: readonly NpcAuthoringTemplateClassAffinitySlug[]
}

export const NPC_AUTHORING_TEMPLATE_TERM = {
  label: 'NPC Authoring Template',
  description:
    'Reusable mechanical or archetypal starting point for NPC creation. Level and class remain contextual.',
  sentence: {
    singular: 'NPC authoring template',
    plural: 'NPC authoring templates',
  },
} as const satisfies VocabularyTerm

export const NPC_AUTHORING_TEMPLATE_ENTRIES = {
  civilian: {
    label: 'Civilian',
    description:
      'General noncombatant or ordinary community member without a specialized mechanical role.',
    searchTerms: ['commoner', 'noncombatant'],
  },
  manual_worker: {
    label: 'Manual worker',
    description:
      'Physical worker suited to labor, hauling, field work, extraction, or similar trades.',
    searchTerms: ['labor', 'laborer', 'worker'],
  },
  artisan: {
    label: 'Artisan',
    description: 'Skilled craftsperson or maker working in a specialized trade.',
    searchTerms: ['craftsperson', 'crafter', 'trade'],
  },
  merchant: {
    label: 'Merchant',
    description:
      'Commercial professional focused on buying, selling, finance, brokerage, or trade.',
    searchTerms: ['broker', 'commerce', 'trader'],
  },
  administrator: {
    label: 'Administrator',
    description: 'Clerical, logistical, managerial, or administrative professional.',
    searchTerms: ['bureaucrat', 'clerk', 'manager'],
  },
  civic_leader: {
    label: 'Civic leader',
    description:
      'Civilian leader whose authority is primarily social, political, institutional, or commercial.',
    searchTerms: ['leader', 'politician'],
  },
  scholar: {
    label: 'Scholar',
    description:
      'Academic, researcher, teacher, archivist, cartographer, or other learned specialist.',
    searchTerms: ['academic', 'researcher', 'teacher'],
  },
  technical_specialist: {
    label: 'Technical specialist',
    description: 'Engineer, surveyor, navigator, or other technically trained professional.',
    searchTerms: ['engineer', 'navigator', 'surveyor'],
  },
  healer: {
    label: 'Healer',
    description: 'Medical or caregiving professional focused on treatment and recovery.',
    searchTerms: ['caregiver', 'medic', 'physician'],
    classAffinityIds: ['cleric'],
  },
  performer: {
    label: 'Performer',
    description: 'Actor, musician, entertainer, playwright, or other performance specialist.',
    searchTerms: ['actor', 'entertainer', 'musician'],
    classAffinityIds: ['bard'],
  },
  maritime_crew: {
    label: 'Maritime crew',
    description: 'Sailor or shipboard worker responsible for operating and maintaining a vessel.',
    searchTerms: ['sailor', 'seafarer', 'shipboard'],
  },
  maritime_officer: {
    label: 'Maritime officer',
    description:
      'Skilled shipboard leader responsible for navigation, command, or crew operations.',
    searchTerms: ['ship captain', 'shipboard leader'],
    classAffinityIds: ['fighter'],
  },
  guard: {
    label: 'Guard',
    description: 'Trained rank-and-file defender, watch member, soldier, or security combatant.',
    searchTerms: ['security', 'soldier', 'watch'],
    classAffinityIds: ['fighter'],
  },
  scout: {
    label: 'Scout',
    description:
      'Mobile field specialist focused on reconnaissance, tracking, navigation, or exploration.',
    searchTerms: ['explorer', 'reconnaissance', 'tracker'],
    classAffinityIds: ['ranger'],
  },
  investigator: {
    label: 'Investigator',
    description: 'Specialist focused on inquiry, detection, inspection, or evidence gathering.',
    searchTerms: ['detective', 'inspector'],
    classAffinityIds: ['rogue'],
  },
  covert_operator: {
    label: 'Covert operator',
    description:
      'Field operative focused on infiltration, theft, espionage, smuggling, or clandestine work.',
    searchTerms: ['espionage', 'infiltration', 'spy'],
    classAffinityIds: ['rogue'],
  },
  martial_specialist: {
    label: 'Martial specialist',
    description: 'Experienced combatant whose role centers on direct martial capability.',
    searchTerms: ['combatant', 'fighter'],
    classAffinityIds: ['fighter', 'barbarian'],
  },
  martial_officer: {
    label: 'Martial officer',
    description: 'Tactical leader responsible for commanding trained combatants.',
    searchTerms: ['officer', 'tactical leader'],
    classAffinityIds: ['fighter', 'paladin'],
  },
  martial_commander: {
    label: 'Martial commander',
    description: 'Senior military or security leader responsible for larger-scale command.',
    searchTerms: ['commander', 'general'],
    classAffinityIds: ['fighter', 'paladin'],
  },
  arcane_practitioner: {
    label: 'Arcane practitioner',
    description: 'Character whose role centers on arcane study, practice, or magical expertise.',
    searchTerms: ['mage', 'sorcerer', 'wizard'],
    classAffinityIds: ['wizard', 'sorcerer'],
  },
  divine_practitioner: {
    label: 'Divine practitioner',
    description:
      'Character whose role centers on religious ministry, divine magic, or sacred practice.',
    searchTerms: ['cleric', 'divine', 'priest'],
    classAffinityIds: ['cleric'],
  },
  nature_practitioner: {
    label: 'Nature practitioner',
    description:
      'Character whose role centers on nature-focused magic, stewardship, or sacred natural practice.',
    searchTerms: ['druid', 'nature magic'],
    classAffinityIds: ['druid'],
  },
} as const satisfies Record<string, NpcAuthoringTemplateEntry>

export type NpcAuthoringTemplateId = keyof typeof NPC_AUTHORING_TEMPLATE_ENTRIES

export const NPC_AUTHORING_TEMPLATE_IDS = keysFromEntries(NPC_AUTHORING_TEMPLATE_ENTRIES)

export const npcAuthoringTemplateIdSchema = vocabEnumFromEntries(NPC_AUTHORING_TEMPLATE_ENTRIES)

export function getNpcAuthoringTemplateEntry(id: string): NpcAuthoringTemplateEntry | undefined {
  return NPC_AUTHORING_TEMPLATE_ENTRIES[id as NpcAuthoringTemplateId]
}

export function getNpcAuthoringTemplateLabel(id: string): string {
  return getNpcAuthoringTemplateEntry(id)?.label ?? id
}

export function getNpcAuthoringTemplateClassAffinityIds(
  id: string,
): readonly NpcAuthoringTemplateClassAffinitySlug[] {
  return getNpcAuthoringTemplateEntry(id)?.classAffinityIds ?? []
}
