import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_A_C = {
  academy: {
    label: 'Academy',
    description: 'A building primarily serving education (advanced).',
    functions: ['knowledge'],
  },
  adventurers_guild: {
    label: 'Adventurers Guild',
    description: 'A building primarily serving quest brokerage.',
    functions: ['assembly', 'governance'],
  },
  almshouse: {
    label: 'Almshouse',
    description: 'A building primarily serving endowed poor housing.',
    functions: ['care'],
  },
  apartment_building: {
    label: 'Apartment Building',
    description: 'A building primarily serving dwelling (multi-household).',
    functions: ['dwelling'],
  },
  apothecary: {
    label: 'Apothecary',
    description: 'A building primarily serving retail (remedies).',
    functions: ['retail', 'care'],
  },
  archive: {
    label: 'Archive',
    description: 'A building primarily serving document custody (restricted).',
    functions: ['knowledge'],
  },
  arena: {
    label: 'Arena',
    description: 'A building primarily serving spectacle games.',
    functions: ['spectacle'],
  },
  armory: {
    label: 'Armory',
    description: 'A building primarily serving arms storage/maintenance.',
    functions: ['storage', 'defense_watch'],
  },
  arsenal: {
    label: 'Arsenal',
    description: 'A building primarily serving arms manufacture.',
    functions: ['storage', 'defense_watch'],
  },
  asylum: {
    label: 'Asylum',
    description: 'A building primarily serving custodial mental care.',
    functions: ['care'],
  },
  auction_house: {
    label: 'Auction House',
    description: 'A building primarily serving sale-event venue.',
    functions: ['retail', 'assembly'],
  },
  audience_hall: {
    label: 'Audience Hall',
    description: 'A building primarily serving assembly.',
    functions: ['assembly', 'governance'],
  },
  bank: {
    label: 'Bank',
    description: 'A building primarily serving finance (deposit/lend).',
    functions: ['finance'],
  },
  barn: {
    label: 'Barn',
    description: 'A building primarily serving farm storage.',
    functions: ['service', 'storage'],
  },
  barracks: {
    label: 'Barracks',
    description: 'A building primarily serving garrison housing.',
    functions: ['defense_watch', 'dwelling'],
  },
  basilica: {
    label: 'Basilica',
    description: 'A building primarily serving assembly hall → church.',
    functions: ['worship', 'assembly'],
    manifestationOf: 'temple',
  },
  bathhouse: {
    label: 'Bathhouse',
    description: 'A building primarily serving bathing service.',
    functions: ['care'],
  },
  beacon_tower: {
    label: 'Beacon Tower',
    description: 'A building primarily serving fire signaling.',
    functions: ['defense_watch'],
  },
  bell_tower: {
    label: 'Bell Tower',
    description: 'A building primarily serving bell housing/signal.',
    functions: ['defense_watch'],
  },
  blacksmith: {
    label: 'Blacksmith',
    description: 'A smithy or metalworking shop.',
    functions: ['service'],
  },
  blockhouse: {
    label: 'Blockhouse',
    description: 'A building primarily serving standalone strongpoint.',
    functions: ['service'],
  },
  boarding_house: {
    label: 'Boarding House',
    description: 'A building primarily serving lodging (residential-term).',
    functions: ['lodging'],
  },
  brewery: {
    label: 'Brewery',
    description: 'A building primarily serving beverage production.',
    functions: ['production'],
  },
  brickworks: {
    label: 'Brickworks',
    description: 'A building primarily serving brick production.',
    functions: ['production'],
  },
  broch: {
    label: 'Broch',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling', 'defense_watch'],
    manifestationOf: 'house',
  },
  brothel: {
    label: 'Brothel',
    description: 'A building primarily serving commercial sex.',
    functions: ['service'],
  },
  caravanserai: {
    label: 'Caravanserai',
    description: 'A roadside inn for merchants and caravan travelers.',
    functions: ['lodging', 'retail'],
    manifestationOf: 'inn',
    searchTerms: ['caravan'],
  },
  charnel_house: {
    label: 'Charnel House',
    description: 'A building primarily serving bone/corpse holding.',
    functions: ['funerary'],
  },
  checkpoint: {
    label: 'Checkpoint',
    description: 'A building primarily serving movement control.',
    functions: ['service'],
  },
  coaching_inn: {
    label: 'Coaching Inn',
    description: 'A building primarily serving relay lodging.',
    functions: ['lodging', 'transport_support'],
  },
  coffeehouse: {
    label: 'Coffeehouse',
    description: 'A building primarily serving coffee.',
    functions: ['service'],
  },
  command_post: {
    label: 'Command Post',
    description: 'A building primarily serving command/control.',
    functions: ['service'],
  },
  courthouse: {
    label: 'Courthouse',
    description: 'A building primarily serving adjudication.',
    functions: ['governance'],
  },
  crannog: {
    label: 'Crannog',
    description: 'A building primarily serving dwelling.',
    functions: ['defense_watch', 'dwelling'],
    manifestationOf: 'house',
  },
  crematorium: {
    label: 'Crematorium',
    description: 'A building primarily serving cremation.',
    functions: ['service'],
  },
  customs_house: {
    label: 'Customs House',
    description: 'A building primarily serving trade inspection.',
    functions: ['governance', 'retail'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
