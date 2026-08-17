import { keysFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { OrganizationClassificationEntry } from './organization-classification-entry'
import { getOrganizationClassificationDiscoveryTerms } from './organization-classification-entry'
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
  },
  brewing: {
    label: 'Brewing',
    description: 'Producing beer, ale, or other brewed beverages.',
    searchTerms: ['ale', 'beer'],
  },
  banking: {
    label: 'Banking',
    description: 'Holding, lending, transferring, or safeguarding money and valuables.',
    searchTerms: ['bank', 'credit', 'lending'],
  },
  apprenticeship: {
    label: 'Apprenticeship',
    description: 'Developing practitioners through supervised occupational learning.',
    searchTerms: ['mentorship', 'vocational learning'],
  },
  smuggling: {
    label: 'Smuggling',
    description: 'Moving restricted or illicit goods, people, or information covertly.',
    searchTerms: ['contraband', 'illicit transport'],
  },
  extortion: {
    label: 'Extortion',
    description:
      'Obtaining money, property, compliance, or advantage through threats, coercion, or intimidation as a sustained organizational practice.',
    aliases: ['blackmail', 'racketeering'],
    searchTerms: ['coercion', 'intimidation', 'protection racket'],
  },
  alchemy: {
    label: 'Alchemy',
    description: 'Preparing elixirs, potions, and transmuted substances through alchemical craft.',
    aliases: ['potion making', 'potions'],
    searchTerms: ['elixir', 'potion', 'transmutation'],
  },
  carpentry: {
    label: 'Carpentry',
    description: 'Building, shaping, and repairing wooden structures and joinery.',
    searchTerms: ['woodworking', 'joiner', 'timberwork'],
  },
  shipbuilding: {
    label: 'Shipbuilding',
    description: 'Constructing, fitting, and repairing ships and naval hulls.',
    searchTerms: ['shipyard', 'shipwright', 'hull', 'naval construction'],
  },
  glassmaking: {
    label: 'Glassmaking',
    description: 'Producing, shaping, and finishing glass goods and vessels.',
    aliases: ['glassblowing'],
    searchTerms: ['glassworks', 'glassblower'],
  },
  cartography: {
    label: 'Cartography',
    description: 'Mapping, charting, and recording geographic and navigational knowledge.',
    searchTerms: ['maps', 'chartmaking'],
  },
  navigation: {
    label: 'Navigation',
    description: 'Planning routes, piloting vessels, and guiding travel across land or sea.',
    aliases: ['piloting', 'seamanship', 'wayfinding'],
    searchTerms: ['navigator', 'helmsman'],
  },
  hunting: {
    label: 'Hunting',
    description: 'Tracking, trapping, and harvesting game or quarry as sustained enterprise.',
    searchTerms: ['hunters lodge', 'game'],
  },
  farming: {
    label: 'Farming',
    description: 'Growing crops, raising livestock, and managing agricultural production.',
    aliases: ['agriculture', 'husbandry', 'ranching'],
    searchTerms: ['farmer', 'harvest'],
  },
  couriering: {
    label: 'Couriering',
    description: 'Delivering messages, parcels, and time-sensitive goods on commission.',
    searchTerms: ['courier', 'dispatch', 'messenger'],
  },
  medicine: {
    label: 'Medicine',
    description:
      'Clinical diagnosis, treatment, surgery, and bodily care as professional practice.',
    aliases: ['healing', 'surgery'],
    searchTerms: ['healer', 'physician', 'surgeon'],
  },
  apothecary: {
    label: 'Apothecary',
    description: 'Compounding, dispensing, and preparing medicinal remedies and compounds.',
    aliases: ['herbalism', 'pharmacy'],
    searchTerms: ['apothecary shop', 'dispensing'],
  },
  scribing: {
    label: 'Scribing',
    description: 'Copying, recording, and preparing written documents and records.',
    searchTerms: ['scribe', 'copying', 'clerical writing'],
  },
  theft: {
    label: 'Theft',
    description:
      'Organized stealing, larceny, and property theft as sustained criminal enterprise.',
    aliases: ['burglary', 'robbery', 'larceny'],
    searchTerms: ['thief', 'stealing'],
  },
  assassination: {
    label: 'Assassination',
    description: 'Contract killing and targeted elimination as sustained covert operation.',
    searchTerms: ['contract killing', 'hit', 'assassin'],
  },
  counterfeiting: {
    label: 'Counterfeiting',
    description: 'Producing false coin, forged documents, or counterfeit goods at scale.',
    aliases: ['forgery'],
    searchTerms: ['false coin', 'fake documents'],
  },
  fencing: {
    label: 'Fencing',
    description:
      'Trading stolen or illicit goods through black-market resale networks — not swordsmanship.',
    searchTerms: ['stolen goods', 'black market', 'fence', 'stolen-goods fencing', 'fence network'],
  },
  piracy: {
    label: 'Piracy',
    description: 'Maritime raiding, privateering, and seaborne plunder as organizational practice.',
    searchTerms: ['privateering', 'raiding at sea', 'buccaneer'],
  },
  espionage: {
    label: 'Espionage',
    description:
      'Covert intelligence gathering, infiltration, and strategic information operations.',
    aliases: ['spycraft'],
    searchTerms: ['spy', 'covert ops', 'infiltration'],
  },
  scouting: {
    label: 'Scouting',
    description:
      'Reconnaissance, ranging, and advance observation for military or exploratory forces.',
    aliases: ['reconnaissance', 'ranging'],
    searchTerms: ['scout', 'pathfinder'],
  },
  performance: {
    label: 'Performance',
    description:
      'Theater, music, dance, storytelling, and staged entertainment as organizational work.',
    aliases: ['theater', 'music', 'dance', 'storytelling'],
    searchTerms: ['entertainer', 'actor', 'bard'],
  },
  masonry: {
    label: 'Masonry',
    description: 'Cutting, laying, and finishing stone and masonry structures.',
    searchTerms: ['stonework', 'mason', 'stonecutting'],
  },
  weaving: {
    label: 'Weaving',
    description: 'Producing cloth and textiles on looms or comparable apparatus.',
    searchTerms: ['loom', 'textile', 'weaver'],
  },
  tailoring: {
    label: 'Tailoring',
    description: 'Cutting, fitting, and sewing garments and finished apparel.',
    searchTerms: ['seamstress', 'garments', 'apparel'],
  },
  leatherworking: {
    label: 'Leatherworking',
    description: 'Tanning hides and crafting leather goods, harness, and apparel.',
    aliases: ['tanning'],
    searchTerms: ['leather', 'hides', 'tanner'],
  },
  cobbling: {
    label: 'Cobbling',
    description: 'Making and repairing footwear and leather shoes.',
    searchTerms: ['cobbler', 'shoemaking', 'footwear'],
  },
  mining: {
    label: 'Mining',
    description: 'Extracting ore, minerals, or stone from mines and quarries.',
    aliases: ['quarrying'],
    searchTerms: ['miner', 'ore', 'quarry'],
  },
  logging: {
    label: 'Logging',
    description: 'Felling, hauling, and processing timber as sustained enterprise.',
    searchTerms: ['timber', 'lumber', 'felling'],
  },
  milling: {
    label: 'Milling',
    description: 'Grinding grain, pulp, or raw materials in mills.',
    searchTerms: ['mill', 'grist', 'grinding'],
  },
  distilling: {
    label: 'Distilling',
    description: 'Producing spirits, liquor, or distilled extracts at scale.',
    searchTerms: ['distillery', 'spirits', 'liquor'],
  },
  fishing: {
    label: 'Fishing',
    description: 'Harvesting fish and aquatic resources through organized fleets or crews.',
    searchTerms: ['fishery', 'fleet', 'catch'],
  },
  printing: {
    label: 'Printing',
    description: 'Setting type, printing, and binding books and printed matter.',
    aliases: ['bookbinding'],
    searchTerms: ['printer', 'press', 'typesetting'],
  },
  warehousing: {
    label: 'Warehousing',
    description: 'Storing, inventorying, and managing goods in warehouse operations.',
    searchTerms: ['warehouse', 'storage', 'inventory'],
  },
  salvage: {
    label: 'Salvage',
    description: 'Recovering value from wrecks, ruins, or discarded materials.',
    searchTerms: ['wreckers', 'recovery', 'salvage yard'],
  },
  brokerage: {
    label: 'Brokerage',
    description: 'Arranging deals, commissions, and trade on behalf of principals.',
    searchTerms: ['broker', 'factor', 'commission'],
  },
  surveying: {
    label: 'Surveying',
    description: 'Measuring land, boundaries, and worksites for mapping and construction.',
    searchTerms: ['land survey', 'boundary', 'chain'],
  },
  translation: {
    label: 'Translation',
    description: 'Rendering texts and speech across languages for communication or record.',
    searchTerms: ['translator', 'interpreter', 'languages'],
  },
  archiving: {
    label: 'Archiving',
    description: 'Preserving, cataloging, and maintaining records and collections.',
    searchTerms: ['archive', 'records', 'catalog'],
  },
  engineering: {
    label: 'Engineering',
    description: 'Designing and directing construction of structures, works, and defenses.',
    searchTerms: ['engineer', 'public works', 'architect'],
  },
  divination: {
    label: 'Divination',
    description: 'Reading omens, signs, and supernatural portents as sustained practice.',
    searchTerms: ['oracle', 'prophecy', 'seer'],
  },
  midwifery: {
    label: 'Midwifery',
    description:
      'Attending childbirth, prenatal care, and maternal health as professional practice.',
    searchTerms: ['midwife', 'childbirth', 'birthing'],
  },
  kidnapping: {
    label: 'Kidnapping',
    description: 'Abducting people for ransom, leverage, or coercion as criminal enterprise.',
    searchTerms: ['abduction', 'ransom', 'captive'],
  },
  poisoning: {
    label: 'Poisoning',
    description: 'Developing and deploying poisons as sustained covert or criminal practice.',
    searchTerms: ['poison', 'toxicant', 'venom'],
  },
  gambling: {
    label: 'Gambling',
    description: 'Operating games of chance, wagers, and betting houses as enterprise.',
    searchTerms: ['gaming', 'wagers', 'betting'],
  },
  bounty_hunting: {
    label: 'Bounty hunting',
    description: 'Pursuing fugitives and captives for posted rewards.',
    searchTerms: ['bounty', 'fugitive', 'manhunt'],
  },
  bodyguarding: {
    label: 'Bodyguarding',
    description: 'Protecting clients through personal escort and close security.',
    searchTerms: ['bodyguard', 'escort', 'protection'],
  },
  siegecraft: {
    label: 'Siegecraft',
    description: 'Building and breaching fortifications, siege engines, and assault works.',
    aliases: ['fortification', 'military engineering'],
    searchTerms: ['siege', 'battering ram', 'sapper'],
  },
  tracking: {
    label: 'Tracking',
    description: 'Following trails, spoor, and physical signs to locate quarry or targets.',
    searchTerms: ['trails', 'spoor', 'trailing'],
  },
  investigation: {
    label: 'Investigation',
    description: 'Fact-finding, casework, and inquiry to establish truth or guilt.',
    searchTerms: ['detective', 'inquiry', 'casework'],
  },
  exorcism: {
    label: 'Exorcism',
    description: 'Banishing, cleansing, or confronting possessing or malign spirits.',
    searchTerms: ['exorcist', 'possession', 'cleansing'],
  },
  pilgrimage: {
    label: 'Pilgrimage',
    description: 'Organizing sacred journeys, routes, and pilgrim care.',
    searchTerms: ['pilgrim', 'sacred journey', 'shrine route'],
  },
  funerary_rites: {
    label: 'Funerary rites',
    description: 'Conducting burial, memorial, and death rites as institutional practice.',
    searchTerms: ['funeral', 'burial', 'mortuary'],
  },
  publishing: {
    label: 'Publishing',
    description: 'Commissioning, editing, and distributing written works for publication.',
    searchTerms: ['publisher', 'editorial', 'press'],
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
