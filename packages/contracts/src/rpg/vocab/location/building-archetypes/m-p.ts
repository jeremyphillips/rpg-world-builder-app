import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_M_P = {
  machiya: {
    label: 'Machiya',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling', 'retail'],
    manifestationOf: 'house',
  },
  madrasa: {
    label: 'Madrasa',
    description: 'A building primarily serving religious education.',
    functions: ['knowledge', 'worship'],
    manifestationOf: 'academy',
  },
  manor: {
    label: 'Manor',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling', 'governance'],
  },
  market: {
    label: 'Market',
    description: 'A building primarily serving retail (many sellers).',
    functions: ['retail'],
  },
  martello_tower: {
    label: 'Martello Tower',
    description: 'A building primarily serving coastal gun platform.',
    functions: ['service'],
  },
  mastaba: {
    label: 'Mastaba',
    description: 'A building primarily serving tomb superstructure.',
    functions: ['funerary'],
    manifestationOf: 'mausoleum',
  },
  mausoleum: {
    label: 'Mausoleum',
    description: 'A building primarily serving monumental interment.',
    functions: ['funerary'],
  },
  meeting_hall: {
    label: 'Meeting Hall',
    description: 'A building primarily serving assembly (secular).',
    functions: ['assembly'],
  },
  memorial_hall: {
    label: 'Memorial Hall',
    description: 'A building primarily serving commemoration.',
    functions: ['funerary', 'assembly'],
  },
  menagerie: {
    label: 'Menagerie',
    description: 'A building primarily serving living collection display.',
    functions: ['spectacle', 'service'],
  },
  mill: {
    label: 'Mill',
    description: 'A building primarily serving mechanical processing.',
    functions: ['production'],
  },
  mint: {
    label: 'Mint',
    description: 'A building primarily serving coin production (state).',
    functions: ['finance', 'production'],
  },
  monastery: {
    label: 'Monastery',
    description: 'A building primarily serving religious community (worship.',
    functions: ['cloistered_community'],
  },
  moot_hall: {
    label: 'Moot Hall',
    description: 'A building primarily serving deliberative assembly.',
    functions: ['assembly', 'governance'],
    manifestationOf: 'town_hall',
  },
  mortuary: {
    label: 'Mortuary',
    description: 'A building primarily serving body preparation.',
    functions: ['service'],
  },
  mosque: {
    label: 'Mosque',
    description: 'A building primarily serving congregational worship.',
    functions: ['worship', 'assembly'],
    manifestationOf: 'temple',
  },
  museum: {
    label: 'Museum',
    description: 'A building primarily serving collection display.',
    functions: ['spectacle'],
  },
  nuraghe: {
    label: 'Nuraghe',
    description: 'A building primarily serving contested (dwelling? fort? rite?).',
    functions: ['defense_watch', 'dwelling'],
  },
  observatory: {
    label: 'Observatory',
    description: 'A building primarily serving sky observation.',
    functions: ['service'],
  },
  orphanage: {
    label: 'Orphanage',
    description: 'A building primarily serving child custodial care.',
    functions: ['care'],
  },
  pagoda: {
    label: 'Pagoda',
    description: 'A building primarily serving relic/veneration tower.',
    functions: ['worship'],
    manifestationOf: 'temple',
  },
  palace: {
    label: 'Palace',
    description: 'A grand residence of a ruler or noble house.',
    functions: ['dwelling', 'governance'],
  },
  paladin_chapterhouse: {
    label: 'Paladin Chapterhouse',
    description: 'A building primarily serving order housing.',
    functions: ['defense_watch', 'worship'],
  },
  poorhouse: {
    label: 'Poorhouse',
    description: 'A building primarily serving pauper relief housing.',
    functions: ['service'],
  },
  post_house: {
    label: 'Post House',
    description: 'A building primarily serving courier relay (horses.',
    functions: ['transport_support'],
  },
  printing_press: {
    label: 'Printing Press',
    description: 'A building primarily serving print production.',
    functions: ['production'],
  },
  prison: {
    label: 'Prison',
    description: 'A building primarily serving detention.',
    functions: ['governance'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
