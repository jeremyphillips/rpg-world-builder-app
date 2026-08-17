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
    aliases: ['blackmail', 'racketeering'],
    searchTerms: ['coercion', 'intimidation', 'protection racket'],
    memberTitles: organizationMemberTitleEntries(
      'Chief',
      'Enforcer',
      'Collector',
      'Lieutenant',
      'Operative',
    ),
  },
  alchemy: {
    label: 'Alchemy',
    description: 'Preparing elixirs, potions, and transmuted substances through alchemical craft.',
    aliases: ['potion making', 'potions'],
    searchTerms: ['elixir', 'potion', 'transmutation'],
    memberTitles: organizationMemberTitleEntries(
      'Master Alchemist',
      'Alchemist',
      'Apprentice',
      'Assistant',
      'Laborer',
    ),
  },
  carpentry: {
    label: 'Carpentry',
    description: 'Building, shaping, and repairing wooden structures and joinery.',
    searchTerms: ['woodworking', 'joiner', 'timberwork'],
    memberTitles: organizationMemberTitleEntries(
      'Master Carpenter',
      'Carpenter',
      'Journeyman',
      'Apprentice',
      'Laborer',
    ),
  },
  shipbuilding: {
    label: 'Shipbuilding',
    description: 'Constructing, fitting, and repairing ships and naval hulls.',
    searchTerms: ['shipyard', 'shipwright', 'hull', 'naval construction'],
    memberTitles: organizationMemberTitleEntries(
      'Master Shipwright',
      'Shipwright',
      'Foreman',
      'Apprentice',
      'Laborer',
    ),
  },
  glassmaking: {
    label: 'Glassmaking',
    description: 'Producing, shaping, and finishing glass goods and vessels.',
    aliases: ['glassblowing'],
    searchTerms: ['glassworks', 'glassblower'],
    memberTitles: organizationMemberTitleEntries(
      'Master Glassmaker',
      'Glassmaker',
      'Blower',
      'Apprentice',
      'Worker',
    ),
  },
  cartography: {
    label: 'Cartography',
    description: 'Mapping, charting, and recording geographic and navigational knowledge.',
    searchTerms: ['maps', 'chartmaking'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Cartographer',
      'Cartographer',
      'Surveyor',
      'Scribe',
      'Apprentice',
    ),
  },
  navigation: {
    label: 'Navigation',
    description: 'Planning routes, piloting vessels, and guiding travel across land or sea.',
    aliases: ['piloting', 'seamanship', 'wayfinding'],
    searchTerms: ['navigator', 'helmsman'],
    memberTitles: organizationMemberTitleEntries(
      'Master Navigator',
      'Navigator',
      'Pilot',
      'Helmsman',
      'Apprentice',
    ),
  },
  hunting: {
    label: 'Hunting',
    description: 'Tracking, trapping, and harvesting game or quarry as sustained enterprise.',
    searchTerms: ['hunters lodge', 'game'],
    memberTitles: organizationMemberTitleEntries(
      'Master Hunter',
      'Hunter',
      'Tracker',
      'Scout',
      'Apprentice',
    ),
  },
  farming: {
    label: 'Farming',
    description: 'Growing crops, raising livestock, and managing agricultural production.',
    aliases: ['agriculture', 'husbandry', 'ranching'],
    searchTerms: ['farmer', 'harvest'],
    memberTitles: organizationMemberTitleEntries(
      'Steward',
      'Farmer',
      'Overseer',
      'Laborer',
      'Apprentice',
    ),
  },
  couriering: {
    label: 'Couriering',
    description: 'Delivering messages, parcels, and time-sensitive goods on commission.',
    searchTerms: ['courier', 'dispatch', 'messenger'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Courier',
      'Courier',
      'Runner',
      'Agent',
      'Apprentice',
    ),
  },
  medicine: {
    label: 'Medicine',
    description:
      'Clinical diagnosis, treatment, surgery, and bodily care as professional practice.',
    aliases: ['healing', 'surgery'],
    searchTerms: ['healer', 'physician', 'surgeon'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Physician',
      'Physician',
      'Surgeon',
      'Healer',
      'Apprentice',
    ),
  },
  apothecary: {
    label: 'Apothecary',
    description: 'Compounding, dispensing, and preparing medicinal remedies and compounds.',
    aliases: ['herbalism', 'pharmacy'],
    searchTerms: ['apothecary shop', 'dispensing'],
    memberTitles: organizationMemberTitleEntries(
      'Master Apothecary',
      'Apothecary',
      'Herbalist',
      'Clerk',
      'Apprentice',
    ),
  },
  scribing: {
    label: 'Scribing',
    description: 'Copying, recording, and preparing written documents and records.',
    searchTerms: ['scribe', 'copying', 'clerical writing'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Scribe',
      'Scribe',
      'Copyist',
      'Clerk',
      'Apprentice',
    ),
  },
  theft: {
    label: 'Theft',
    description:
      'Organized stealing, larceny, and property theft as sustained criminal enterprise.',
    aliases: ['burglary', 'robbery', 'larceny'],
    searchTerms: ['thief', 'stealing'],
    memberTitles: organizationMemberTitleEntries(
      'Guildmaster',
      'Master Thief',
      'Cutpurse',
      'Operative',
      'Apprentice',
    ),
  },
  assassination: {
    label: 'Assassination',
    description: 'Contract killing and targeted elimination as sustained covert operation.',
    searchTerms: ['contract killing', 'hit', 'assassin'],
    memberTitles: organizationMemberTitleEntries(
      'Master Assassin',
      'Assassin',
      'Operative',
      'Agent',
      'Recruit',
    ),
  },
  counterfeiting: {
    label: 'Counterfeiting',
    description: 'Producing false coin, forged documents, or counterfeit goods at scale.',
    aliases: ['forgery'],
    searchTerms: ['false coin', 'fake documents'],
    memberTitles: organizationMemberTitleEntries(
      'Master Forger',
      'Forger',
      'Engraver',
      'Distributor',
      'Apprentice',
    ),
  },
  fencing: {
    label: 'Fencing',
    description:
      'Trading stolen or illicit goods through black-market resale networks — not swordsmanship.',
    searchTerms: ['stolen goods', 'black market', 'fence', 'stolen-goods fencing', 'fence network'],
    memberTitles: organizationMemberTitleEntries('Fence', 'Broker', 'Dealer', 'Agent', 'Runner'),
  },
  piracy: {
    label: 'Piracy',
    description: 'Maritime raiding, privateering, and seaborne plunder as organizational practice.',
    searchTerms: ['privateering', 'raiding at sea', 'buccaneer'],
    memberTitles: organizationMemberTitleEntries(
      'Captain',
      'Quartermaster',
      'Boatswain',
      'Gunner',
      'Crewman',
    ),
  },
  espionage: {
    label: 'Espionage',
    description:
      'Covert intelligence gathering, infiltration, and strategic information operations.',
    aliases: ['spycraft'],
    searchTerms: ['spy', 'covert ops', 'infiltration'],
    memberTitles: organizationMemberTitleEntries(
      'Spymaster',
      'Agent',
      'Operative',
      'Informer',
      'Recruit',
    ),
  },
  scouting: {
    label: 'Scouting',
    description:
      'Reconnaissance, ranging, and advance observation for military or exploratory forces.',
    aliases: ['reconnaissance', 'ranging'],
    searchTerms: ['scout', 'pathfinder'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Scout',
      'Scout',
      'Ranger',
      'Pathfinder',
      'Apprentice',
    ),
  },
  performance: {
    label: 'Performance',
    description:
      'Theater, music, dance, storytelling, and staged entertainment as organizational work.',
    aliases: ['theater', 'music', 'dance', 'storytelling'],
    searchTerms: ['entertainer', 'actor', 'bard'],
    memberTitles: organizationMemberTitleEntries(
      'Director',
      'Lead Performer',
      'Performer',
      'Apprentice',
      'Stagehand',
    ),
  },
  masonry: {
    label: 'Masonry',
    description: 'Cutting, laying, and finishing stone and masonry structures.',
    searchTerms: ['stonework', 'mason', 'stonecutting'],
    memberTitles: organizationMemberTitleEntries(
      'Master Mason',
      'Mason',
      'Journeyman',
      'Apprentice',
      'Laborer',
    ),
  },
  weaving: {
    label: 'Weaving',
    description: 'Producing cloth and textiles on looms or comparable apparatus.',
    searchTerms: ['loom', 'textile', 'weaver'],
    memberTitles: organizationMemberTitleEntries(
      'Master Weaver',
      'Weaver',
      'Journeyman',
      'Apprentice',
      'Worker',
    ),
  },
  tailoring: {
    label: 'Tailoring',
    description: 'Cutting, fitting, and sewing garments and finished apparel.',
    searchTerms: ['seamstress', 'garments', 'apparel'],
    memberTitles: organizationMemberTitleEntries(
      'Master Tailor',
      'Tailor',
      'Seamstress',
      'Apprentice',
      'Worker',
    ),
  },
  leatherworking: {
    label: 'Leatherworking',
    description: 'Tanning hides and crafting leather goods, harness, and apparel.',
    aliases: ['tanning'],
    searchTerms: ['leather', 'hides', 'tanner'],
    memberTitles: organizationMemberTitleEntries(
      'Master Leatherworker',
      'Leatherworker',
      'Tanner',
      'Apprentice',
      'Worker',
    ),
  },
  cobbling: {
    label: 'Cobbling',
    description: 'Making and repairing footwear and leather shoes.',
    searchTerms: ['cobbler', 'shoemaking', 'footwear'],
    memberTitles: organizationMemberTitleEntries(
      'Master Cobbler',
      'Cobbler',
      'Shoemaker',
      'Apprentice',
      'Worker',
    ),
  },
  mining: {
    label: 'Mining',
    description: 'Extracting ore, minerals, or stone from mines and quarries.',
    aliases: ['quarrying'],
    searchTerms: ['miner', 'ore', 'quarry'],
    memberTitles: organizationMemberTitleEntries(
      'Mine Captain',
      'Miner',
      'Foreman',
      'Laborer',
      'Apprentice',
    ),
  },
  logging: {
    label: 'Logging',
    description: 'Felling, hauling, and processing timber as sustained enterprise.',
    searchTerms: ['timber', 'lumber', 'felling'],
    memberTitles: organizationMemberTitleEntries(
      'Head Logger',
      'Logger',
      'Feller',
      'Teamster',
      'Laborer',
    ),
  },
  milling: {
    label: 'Milling',
    description: 'Grinding grain, pulp, or raw materials in mills.',
    searchTerms: ['mill', 'grist', 'grinding'],
    memberTitles: organizationMemberTitleEntries(
      'Master Miller',
      'Miller',
      'Grinder',
      'Apprentice',
      'Laborer',
    ),
  },
  distilling: {
    label: 'Distilling',
    description: 'Producing spirits, liquor, or distilled extracts at scale.',
    searchTerms: ['distillery', 'spirits', 'liquor'],
    memberTitles: organizationMemberTitleEntries(
      'Master Distiller',
      'Distiller',
      'Stillman',
      'Apprentice',
      'Worker',
    ),
  },
  fishing: {
    label: 'Fishing',
    description: 'Harvesting fish and aquatic resources through organized fleets or crews.',
    searchTerms: ['fishery', 'fleet', 'catch'],
    memberTitles: organizationMemberTitleEntries(
      'Master Fisher',
      'Fisher',
      'Netmaker',
      'Deckhand',
      'Apprentice',
    ),
  },
  printing: {
    label: 'Printing',
    description: 'Setting type, printing, and binding books and printed matter.',
    aliases: ['bookbinding'],
    searchTerms: ['printer', 'press', 'typesetting'],
    memberTitles: organizationMemberTitleEntries(
      'Master Printer',
      'Printer',
      'Compositor',
      'Apprentice',
      'Worker',
    ),
  },
  warehousing: {
    label: 'Warehousing',
    description: 'Storing, inventorying, and managing goods in warehouse operations.',
    searchTerms: ['warehouse', 'storage', 'inventory'],
    memberTitles: organizationMemberTitleEntries(
      'Warehouse Master',
      'Foreman',
      'Clerk',
      'Porter',
      'Laborer',
    ),
  },
  salvage: {
    label: 'Salvage',
    description: 'Recovering value from wrecks, ruins, or discarded materials.',
    searchTerms: ['wreckers', 'recovery', 'salvage yard'],
    memberTitles: organizationMemberTitleEntries(
      'Salvage Master',
      'Salvager',
      'Wrecker',
      'Diver',
      'Laborer',
    ),
  },
  brokerage: {
    label: 'Brokerage',
    description: 'Arranging deals, commissions, and trade on behalf of principals.',
    searchTerms: ['broker', 'factor', 'commission'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Broker',
      'Broker',
      'Factor',
      'Agent',
      'Clerk',
    ),
  },
  surveying: {
    label: 'Surveying',
    description: 'Measuring land, boundaries, and worksites for mapping and construction.',
    searchTerms: ['land survey', 'boundary', 'chain'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Surveyor',
      'Surveyor',
      'Chainman',
      'Rodman',
      'Apprentice',
    ),
  },
  translation: {
    label: 'Translation',
    description: 'Rendering texts and speech across languages for communication or record.',
    searchTerms: ['translator', 'interpreter', 'languages'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Translator',
      'Translator',
      'Interpreter',
      'Scribe',
      'Apprentice',
    ),
  },
  archiving: {
    label: 'Archiving',
    description: 'Preserving, cataloging, and maintaining records and collections.',
    searchTerms: ['archive', 'records', 'catalog'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Archivist',
      'Archivist',
      'Curator',
      'Clerk',
      'Apprentice',
    ),
  },
  engineering: {
    label: 'Engineering',
    description: 'Designing and directing construction of structures, works, and defenses.',
    searchTerms: ['engineer', 'public works', 'architect'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Engineer',
      'Engineer',
      'Architect',
      'Foreman',
      'Apprentice',
    ),
  },
  divination: {
    label: 'Divination',
    description: 'Reading omens, signs, and supernatural portents as sustained practice.',
    searchTerms: ['oracle', 'prophecy', 'seer'],
    memberTitles: organizationMemberTitleEntries(
      'Seer',
      'Diviner',
      'Oracle',
      'Interpreter',
      'Acolyte',
    ),
  },
  midwifery: {
    label: 'Midwifery',
    description:
      'Attending childbirth, prenatal care, and maternal health as professional practice.',
    searchTerms: ['midwife', 'childbirth', 'birthing'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Midwife',
      'Midwife',
      'Doula',
      'Apprentice',
      'Assistant',
    ),
  },
  kidnapping: {
    label: 'Kidnapping',
    description: 'Abducting people for ransom, leverage, or coercion as criminal enterprise.',
    searchTerms: ['abduction', 'ransom', 'captive'],
    memberTitles: organizationMemberTitleEntries(
      'Ringleader',
      'Kidnapper',
      'Abductor',
      'Operative',
      'Recruit',
    ),
  },
  poisoning: {
    label: 'Poisoning',
    description: 'Developing and deploying poisons as sustained covert or criminal practice.',
    searchTerms: ['poison', 'toxicant', 'venom'],
    memberTitles: organizationMemberTitleEntries(
      'Master Poisoner',
      'Poisoner',
      'Chemist',
      'Operative',
      'Apprentice',
    ),
  },
  gambling: {
    label: 'Gambling',
    description: 'Operating games of chance, wagers, and betting houses as enterprise.',
    searchTerms: ['gaming', 'wagers', 'betting'],
    memberTitles: organizationMemberTitleEntries(
      'House Master',
      'Croupier',
      'Dealer',
      'Pit Boss',
      'Runner',
    ),
  },
  bounty_hunting: {
    label: 'Bounty hunting',
    description: 'Pursuing fugitives and captives for posted rewards.',
    searchTerms: ['bounty', 'fugitive', 'manhunt'],
    memberTitles: organizationMemberTitleEntries(
      'Bounty Master',
      'Bounty Hunter',
      'Tracker',
      'Agent',
      'Recruit',
    ),
  },
  bodyguarding: {
    label: 'Bodyguarding',
    description: 'Protecting clients through personal escort and close security.',
    searchTerms: ['bodyguard', 'escort', 'protection'],
    memberTitles: organizationMemberTitleEntries(
      'Captain',
      'Bodyguard',
      'Guard',
      'Escort',
      'Recruit',
    ),
  },
  siegecraft: {
    label: 'Siegecraft',
    description: 'Building and breaching fortifications, siege engines, and assault works.',
    aliases: ['fortification', 'military engineering'],
    searchTerms: ['siege', 'battering ram', 'sapper'],
    memberTitles: organizationMemberTitleEntries(
      'Siege Master',
      'Engineer',
      'Sapper',
      'Artillerist',
      'Laborer',
    ),
  },
  tracking: {
    label: 'Tracking',
    description: 'Following trails, spoor, and physical signs to locate quarry or targets.',
    searchTerms: ['trails', 'spoor', 'trailing'],
    memberTitles: organizationMemberTitleEntries(
      'Master Tracker',
      'Tracker',
      'Pathfinder',
      'Scout',
      'Apprentice',
    ),
  },
  investigation: {
    label: 'Investigation',
    description: 'Fact-finding, casework, and inquiry to establish truth or guilt.',
    searchTerms: ['detective', 'inquiry', 'casework'],
    memberTitles: organizationMemberTitleEntries(
      'Chief Investigator',
      'Investigator',
      'Detective',
      'Analyst',
      'Agent',
    ),
  },
  exorcism: {
    label: 'Exorcism',
    description: 'Banishing, cleansing, or confronting possessing or malign spirits.',
    searchTerms: ['exorcist', 'possession', 'cleansing'],
    memberTitles: organizationMemberTitleEntries(
      'Exorcist',
      'Purifier',
      'Acolyte',
      'Lay Brother',
      'Novice',
    ),
  },
  pilgrimage: {
    label: 'Pilgrimage',
    description: 'Organizing sacred journeys, routes, and pilgrim care.',
    searchTerms: ['pilgrim', 'sacred journey', 'shrine route'],
    memberTitles: organizationMemberTitleEntries(
      'Pilgrim Guide',
      'Pilgrim Master',
      'Chaplain',
      'Custodian',
      'Novice',
    ),
  },
  funerary_rites: {
    label: 'Funerary rites',
    description: 'Conducting burial, memorial, and death rites as institutional practice.',
    searchTerms: ['funeral', 'burial', 'mortuary'],
    memberTitles: organizationMemberTitleEntries(
      'Undertaker',
      'Mortician',
      'Embalmer',
      'Sexton',
      'Acolyte',
    ),
  },
  publishing: {
    label: 'Publishing',
    description: 'Commissioning, editing, and distributing written works for publication.',
    searchTerms: ['publisher', 'editorial', 'press'],
    memberTitles: organizationMemberTitleEntries(
      'Publisher',
      'Editor',
      'Author',
      'Printer',
      'Clerk',
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
