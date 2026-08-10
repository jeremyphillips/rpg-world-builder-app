import { type RefinementCtx } from 'zod'

import { closedSetEnum } from './enum-schema'
import type { OrganizationKind } from './organization-kind'
import { ORGANIZATION_KIND_IDS } from './organization-kind'
import type { OrganizationMemberTitleEntry } from './organization-member-title-entry'
import { organizationMemberTitleEntries } from './organization-member-title-entry'
import type { GameTermEntry, VocabularyTerm } from './types'

export const ORGANIZATION_SUBTYPE_TERM = {
  label: 'Organization Subtype',
  description: 'The organizational form of an organization within its primary kind.',
  sentence: {
    singular: 'organization subtype',
    plural: 'organization subtypes',
  },
} as const satisfies VocabularyTerm

/** Subtype entry — `memberTitles` is required so a new subtype cannot skip title vocabulary. */
export type OrganizationSubtypeEntry = GameTermEntry & {
  readonly memberTitles: readonly [OrganizationMemberTitleEntry, ...OrganizationMemberTitleEntry[]]
}

export const ORGANIZATION_SUBTYPES_BY_KIND = {
  government: {
    monarchy: {
      label: 'Monarchy',
      description: 'A government organized around a monarch or royal house.',
      memberTitles: organizationMemberTitleEntries(
        'Monarch',
        'Regent',
        'Chancellor',
        'Chamberlain',
        'Royal Advisor',
      ),
    },
    council: {
      label: 'Council',
      description: 'A governing body whose authority is exercised by a council.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Councillor',
        'Speaker',
        'Delegate',
        'Clerk',
      ),
    },
    assembly: {
      label: 'Assembly',
      description: 'A representative, deliberative, or legislative governing body.',
      memberTitles: organizationMemberTitleEntries(
        'Speaker',
        'Representative',
        'Delegate',
        'Councillor',
        'Clerk',
      ),
    },
    administration: {
      label: 'Administration',
      description: 'A bureaucracy or administrative governing body.',
      memberTitles: organizationMemberTitleEntries(
        'Governor',
        'Administrator',
        'Minister',
        'Secretary',
        'Official',
      ),
    },
    magistracy: {
      label: 'Magistracy',
      description: 'A government organized around magistrates or appointed civic officers.',
      memberTitles: organizationMemberTitleEntries(
        'Chief Magistrate',
        'Magistrate',
        'Prefect',
        'Clerk',
        'Bailiff',
      ),
    },
  },
  political: {
    party: {
      label: 'Party',
      description: 'An organized political party seeking or exercising influence.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Representative',
        'Organizer',
        'Delegate',
        'Member',
      ),
    },
    movement: {
      label: 'Movement',
      description: 'A political movement organized around a cause or program.',
      memberTitles: organizationMemberTitleEntries(
        'Leader',
        'Organizer',
        'Advocate',
        'Activist',
        'Supporter',
      ),
    },
    noble_bloc: {
      label: 'Noble bloc',
      description: 'A coalition of nobles or aristocratic houses pursuing shared interests.',
      memberTitles: organizationMemberTitleEntries(
        'Patron',
        'Noble',
        'Representative',
        'Retainer',
        'Supporter',
      ),
    },
    court_faction: {
      label: 'Court faction',
      description: 'A political faction operating within a royal or ruling court.',
      memberTitles: organizationMemberTitleEntries(
        'Patron',
        'Courtier',
        'Advisor',
        'Agent',
        'Supporter',
      ),
    },
    advocacy_group: {
      label: 'Advocacy group',
      description: 'An organization pursuing influence around a particular cause or constituency.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Advocate',
        'Organizer',
        'Representative',
        'Member',
      ),
    },
  },
  religious: {
    church: {
      label: 'Church',
      description: 'An organized religious institution or congregation.',
      memberTitles: organizationMemberTitleEntries(
        'High Priest',
        'Priest',
        'Deacon',
        'Acolyte',
        'Initiate',
      ),
    },
    cult: {
      label: 'Cult',
      description:
        'A religious group centered on a particular deity, entity, mystery, or doctrine.',
      memberTitles: organizationMemberTitleEntries(
        'Cult Leader',
        'Priest',
        'Disciple',
        'Acolyte',
        'Initiate',
      ),
    },
    temple: {
      label: 'Temple',
      description:
        'A religious institution organized around worship at or stewardship of a sacred site.',
      memberTitles: organizationMemberTitleEntries(
        'High Priest',
        'Priest',
        'Keeper',
        'Acolyte',
        'Initiate',
      ),
    },
    holy_order: {
      label: 'Holy order',
      description: 'A religious order organized around service, protection, or a sacred mission.',
      memberTitles: organizationMemberTitleEntries(
        'Grand Master',
        'Commander',
        'Knight',
        'Chaplain',
        'Initiate',
      ),
    },
    monastic_order: {
      label: 'Monastic order',
      description: 'A religious community organized around monastic life or discipline.',
      memberTitles: organizationMemberTitleEntries(
        'Abbot/Abbess',
        'Prior',
        'Monk/Nun',
        'Novice',
        'Oblate',
      ),
    },
  },
  military: {
    army: {
      label: 'Army',
      description: 'A formal military force.',
      memberTitles: organizationMemberTitleEntries(
        'General',
        'Commander',
        'Captain',
        'Officer',
        'Soldier',
      ),
    },
    guard: {
      label: 'Guard',
      description: 'A force responsible for protection, policing, or watch duties.',
      memberTitles: organizationMemberTitleEntries(
        'Captain',
        'Watch Commander',
        'Sergeant',
        'Guard',
        'Recruit',
      ),
    },
    militia: {
      label: 'Militia',
      description: 'A locally raised or part-time armed force.',
      memberTitles: organizationMemberTitleEntries(
        'Commander',
        'Captain',
        'Sergeant',
        'Volunteer',
        'Recruit',
      ),
    },
    mercenary_company: {
      label: 'Mercenary company',
      description: 'A professional armed company serving for payment or contract.',
      memberTitles: organizationMemberTitleEntries(
        'Company Commander',
        'Captain',
        'Lieutenant',
        'Mercenary',
        'Recruit',
      ),
    },
    martial_order: {
      label: 'Martial order',
      description: 'An organized martial brotherhood, knightly order, or similar force.',
      memberTitles: organizationMemberTitleEntries(
        'Grand Master',
        'Commander',
        'Captain',
        'Knight',
        'Initiate',
      ),
    },
  },
  criminal: {
    syndicate: {
      label: 'Syndicate',
      description: 'A structured criminal network coordinating multiple operations.',
      memberTitles: organizationMemberTitleEntries(
        'Boss',
        'Underboss',
        'Lieutenant',
        'Enforcer',
        'Associate',
      ),
    },
    gang: {
      label: 'Gang',
      description: 'A localized or loosely structured criminal group.',
      memberTitles: organizationMemberTitleEntries(
        'Boss',
        'Lieutenant',
        'Enforcer',
        'Runner',
        'Member',
      ),
    },
    thieves_guild: {
      label: "Thieves' guild",
      description: 'An organized guild or network of thieves and related criminals.',
      memberTitles: organizationMemberTitleEntries(
        'Guildmaster',
        'Master Thief',
        'Thief',
        'Cutpurse',
        'Apprentice',
      ),
    },
    smuggling_ring: {
      label: 'Smuggling ring',
      description: 'A network organized around moving illicit goods or people.',
      memberTitles: organizationMemberTitleEntries(
        'Ringleader',
        'Coordinator',
        'Smuggler',
        'Courier',
        'Lookout',
      ),
    },
    pirate_crew: {
      label: 'Pirate crew',
      description: 'A criminal organization operating as a pirate crew.',
      memberTitles: organizationMemberTitleEntries(
        'Captain',
        'Quartermaster',
        'Boatswain',
        'Crew',
        'Swab',
      ),
    },
  },
  commercial: {
    company: {
      label: 'Company',
      description: 'A general business or commercial enterprise.',
      memberTitles: organizationMemberTitleEntries(
        'Director',
        'Partner',
        'Manager',
        'Agent',
        'Employee',
      ),
    },
    merchant_house: {
      label: 'Merchant house',
      description: 'A merchant family or house operating as a commercial organization.',
      memberTitles: organizationMemberTitleEntries(
        'House Head',
        'Factor',
        'Merchant',
        'Agent',
        'Clerk',
      ),
    },
    trading_consortium: {
      label: 'Trading consortium',
      description: 'Multiple merchants or interests organized around shared trade.',
      memberTitles: organizationMemberTitleEntries('Chair', 'Partner', 'Factor', 'Agent', 'Broker'),
    },
    bank: {
      label: 'Bank',
      description: 'A financial institution dealing in deposits, lending, exchange, or credit.',
      memberTitles: organizationMemberTitleEntries(
        'Director',
        'Treasurer',
        'Banker',
        'Clerk',
        'Agent',
      ),
    },
    cooperative: {
      label: 'Cooperative',
      description: 'A commercial organization jointly owned or operated by its members.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Steward',
        'Treasurer',
        'Member',
        'Worker',
      ),
    },
  },
  professional: {
    craft_guild: {
      label: 'Craft guild',
      description: 'A guild organized around a particular craft.',
      memberTitles: organizationMemberTitleEntries(
        'Guildmaster',
        'Master',
        'Journeyman',
        'Apprentice',
        'Member',
      ),
    },
    trade_guild: {
      label: 'Trade guild',
      description: 'A guild representing merchants or a particular trade.',
      memberTitles: organizationMemberTitleEntries(
        'Guildmaster',
        'Factor',
        'Merchant',
        'Broker',
        'Member',
      ),
    },
    professional_association: {
      label: 'Professional association',
      description: 'An association of practitioners in a profession.',
      memberTitles: organizationMemberTitleEntries(
        'President',
        'Officer',
        'Practitioner',
        'Associate',
        'Member',
      ),
    },
    labor_association: {
      label: 'Labor association',
      description: 'An organization representing workers or labor interests.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Steward',
        'Organizer',
        'Representative',
        'Member',
      ),
    },
    fellowship: {
      label: 'Fellowship',
      description: 'A professional or occupational fellowship organized around shared practice.',
      memberTitles: organizationMemberTitleEntries(
        'Master',
        'Fellow',
        'Associate',
        'Member',
        'Initiate',
      ),
    },
  },
  academic: {
    school: {
      label: 'School',
      description: 'An institution primarily organized around instruction.',
      memberTitles: organizationMemberTitleEntries(
        'Headmaster',
        'Instructor',
        'Tutor',
        'Scholar',
        'Student',
      ),
    },
    college: {
      label: 'College',
      description: 'A formal institution of higher learning.',
      memberTitles: organizationMemberTitleEntries(
        'Rector',
        'Dean',
        'Professor',
        'Scholar',
        'Student',
      ),
    },
    academy: {
      label: 'Academy',
      description: 'An institution organized around specialized teaching or study.',
      memberTitles: organizationMemberTitleEntries(
        'Chancellor',
        'Master',
        'Instructor',
        'Scholar',
        'Student',
      ),
    },
    library: {
      label: 'Library',
      description:
        'An institution organized around collecting, preserving, or providing knowledge.',
      memberTitles: organizationMemberTitleEntries(
        'Chief Librarian',
        'Librarian',
        'Archivist',
        'Scholar',
        'Assistant',
      ),
    },
    learned_society: {
      label: 'Learned society',
      description: 'An association of scholars or researchers pursuing a field of study.',
      memberTitles: organizationMemberTitleEntries(
        'President',
        'Fellow',
        'Scholar',
        'Correspondent',
        'Member',
      ),
    },
  },
  community: {
    clan: {
      label: 'Clan',
      description: 'A community organization built around kinship or a shared lineage.',
      memberTitles: organizationMemberTitleEntries(
        'Clan Chief',
        'Elder',
        'Champion',
        'Retainer',
        'Member',
      ),
    },
    neighborhood_association: {
      label: 'Neighborhood association',
      description: 'A group representing a neighborhood or local community.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Steward',
        'Organizer',
        'Representative',
        'Member',
      ),
    },
    mutual_aid_group: {
      label: 'Mutual-aid group',
      description: 'A community organization providing reciprocal assistance.',
      memberTitles: organizationMemberTitleEntries(
        'Coordinator',
        'Steward',
        'Organizer',
        'Volunteer',
        'Member',
      ),
    },
    civic_association: {
      label: 'Civic association',
      description: 'A local organization pursuing civic or community interests.',
      memberTitles: organizationMemberTitleEntries(
        'Chair',
        'Officer',
        'Organizer',
        'Representative',
        'Member',
      ),
    },
    social_club: {
      label: 'Social club',
      description: 'A community organized primarily around social membership or shared activity.',
      memberTitles: organizationMemberTitleEntries(
        'President',
        'Steward',
        'Host',
        'Member',
        'Initiate',
      ),
    },
  },
  /** No canonical subtypes yet — keep the kind exhaustiveness slot empty. */
  other: {},
} as const satisfies Record<OrganizationKind, Record<string, OrganizationSubtypeEntry>>

type SubtypesByKind = typeof ORGANIZATION_SUBTYPES_BY_KIND

export type OrganizationSubtype = {
  [K in OrganizationKind]: keyof SubtypesByKind[K] & string
}[OrganizationKind]

function collectOrganizationSubtypeIds(): [OrganizationSubtype, ...OrganizationSubtype[]] {
  const ids: OrganizationSubtype[] = []
  for (const kind of ORGANIZATION_KIND_IDS) {
    ids.push(...(Object.keys(ORGANIZATION_SUBTYPES_BY_KIND[kind]) as OrganizationSubtype[]))
  }
  if (ids.length === 0) {
    throw new Error('ORGANIZATION_SUBTYPES_BY_KIND must define at least one subtype')
  }
  return ids as [OrganizationSubtype, ...OrganizationSubtype[]]
}

export const ORGANIZATION_SUBTYPE_IDS = collectOrganizationSubtypeIds()

export const organizationSubtypeSchema = closedSetEnum(ORGANIZATION_SUBTYPE_IDS)

/** Returns subtype ids for an organization kind (empty for `other`). */
export function getOrganizationSubtypeIds(kind: OrganizationKind): readonly OrganizationSubtype[] {
  return Object.keys(ORGANIZATION_SUBTYPES_BY_KIND[kind]) as OrganizationSubtype[]
}

/** True when the subtype id is registered under the given kind. */
export function isOrganizationSubtypeValidForKind(
  kind: OrganizationKind,
  subtype: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(ORGANIZATION_SUBTYPES_BY_KIND[kind], subtype)
}

/** Kind-scoped subtype entry lookup — never discovers parent kind from a flat id. */
export function getOrganizationSubtypeEntry(
  kind: OrganizationKind,
  subtype: string,
): OrganizationSubtypeEntry | undefined {
  const map = ORGANIZATION_SUBTYPES_BY_KIND[kind] as Record<string, OrganizationSubtypeEntry>
  return map[subtype]
}

/** Kind-scoped subtype label. Falls back to the raw id when unknown for that kind. */
export function getOrganizationSubtypeLabel(kind: OrganizationKind, subtype: string): string {
  return getOrganizationSubtypeEntry(kind, subtype)?.label ?? subtype
}

/** Shared kind/subtype pair refinement for organization body and input schemas. */
export function refineOrganizationKindSubtypePair(
  data: {
    organizationKind?: string
    organizationSubtype?: string | null
  },
  ctx: RefinementCtx,
): void {
  const { organizationKind, organizationSubtype } = data
  if (organizationSubtype === undefined || organizationSubtype === null) return
  if (organizationKind === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'organizationSubtype requires organizationKind.',
      path: ['organizationSubtype'],
    })
    return
  }
  if (
    !ORGANIZATION_KIND_IDS.includes(organizationKind as OrganizationKind) ||
    !isOrganizationSubtypeValidForKind(organizationKind as OrganizationKind, organizationSubtype)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: `organizationSubtype '${organizationSubtype}' is not valid for organizationKind '${organizationKind}'.`,
      path: ['organizationSubtype'],
    })
  }
}
