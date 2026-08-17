import type { OrganizationAuthoringPresetId } from '@rpg/contracts'

/**
 * Frozen corpus v0.1 — breadth-v1 completion baseline (fifty presets).
 *
 * Regression guard for preset / discoveryTerm changes. Update rows deliberately
 * when the picker changes on purpose; do not treat coverage % as an ongoing KPI.
 */
export const ORGANIZATION_PRESET_COVERAGE_OUTCOMES = [
  'direct',
  'discoverable',
  'undiscoverable',
  'weak',
  'no_start',
  'inappropriate',
] as const

export type OrganizationPresetCoverageOutcome =
  (typeof ORGANIZATION_PRESET_COVERAGE_OUTCOMES)[number]

export type OrganizationPresetCoverageRow = {
  /** Stable corpus id from organization-taxonomy-discovery Phase 2. */
  id: string
  /** Author-facing familiar label used as the intentional search query. */
  query: string
  outcome: OrganizationPresetCoverageOutcome
  /** Approved honest parent preset when outcome is discoverable, undiscoverable, or weak. */
  parent?: OrganizationAuthoringPresetId
}

/**
 * Frozen corpus v0.1 coverage — breadth-v1 picker (fifty presets).
 */
export const ORGANIZATION_PRESET_COVERAGE_FIXTURE = [
  // 1. Government / administrative (12)
  { id: 'government_ministry', query: 'Government ministry', outcome: 'direct' },
  { id: 'city_council', query: 'City council', outcome: 'direct' },
  {
    id: 'royal_court',
    query: 'Royal court',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  { id: 'bureaucracy', query: 'Bureaucracy', outcome: 'inappropriate' },
  { id: 'parliament', query: 'Parliament', outcome: 'discoverable', parent: 'city_council' },
  { id: 'senate', query: 'Senate', outcome: 'discoverable', parent: 'city_council' },
  {
    id: 'magistracy',
    query: 'Magistracy',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  {
    id: 'exchequer',
    query: 'Exchequer',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  {
    id: 'diplomatic_corps',
    query: 'Diplomatic corps',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  {
    id: 'colonial_administration',
    query: 'Colonial administration',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  { id: 'privy_council', query: 'Privy council', outcome: 'discoverable', parent: 'city_council' },
  {
    id: 'provincial_governorate',
    query: 'Provincial governorate',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },

  // 2. Political / revolutionary (8)
  { id: 'political_party', query: 'Political party', outcome: 'direct' },
  { id: 'revolutionary_cell', query: 'Revolutionary cell', outcome: 'no_start' },
  { id: 'noble_faction', query: 'Noble faction', outcome: 'inappropriate' },
  {
    id: 'reform_league',
    query: 'Reform league',
    outcome: 'discoverable',
    parent: 'political_party',
  },
  {
    id: 'advocacy_society',
    query: 'Advocacy society',
    outcome: 'discoverable',
    parent: 'political_party',
  },
  { id: 'succession_cabal', query: 'Succession cabal', outcome: 'no_start' },
  { id: 'independence_front', query: 'Independence front', outcome: 'inappropriate' },
  { id: 'populist_movement', query: 'Populist movement', outcome: 'inappropriate' },

  // 3. Military / martial (12)
  { id: 'army', query: 'Army', outcome: 'direct' },
  { id: 'navy', query: 'Navy', outcome: 'direct' },
  { id: 'militia', query: 'Militia', outcome: 'direct' },
  { id: 'royal_guard', query: 'Royal guard', outcome: 'discoverable', parent: 'army' },
  { id: 'knightly_order', query: 'Knightly order', outcome: 'direct' },
  { id: 'marines', query: 'Marines', outcome: 'discoverable', parent: 'army' },
  { id: 'sky_fleet', query: 'Sky fleet', outcome: 'discoverable', parent: 'army' },
  { id: 'garrison', query: 'Garrison', outcome: 'discoverable', parent: 'army' },
  { id: 'warband', query: 'Warband', outcome: 'discoverable', parent: 'army' },
  { id: 'legion', query: 'Legion', outcome: 'discoverable', parent: 'army' },
  { id: 'siege_engineers', query: 'Siege engineers', outcome: 'inappropriate' },
  { id: 'crusading_host', query: 'Crusading host', outcome: 'discoverable', parent: 'army' },

  // 4. Policing / security / intelligence (8)
  { id: 'city_watch', query: 'City watch', outcome: 'direct' },
  {
    id: 'secret_police',
    query: 'Secret police',
    outcome: 'discoverable',
    parent: 'intelligence_bureau',
  },
  { id: 'intelligence_bureau', query: 'Intelligence bureau', outcome: 'direct' },
  { id: 'spy_ring', query: 'Spy ring', outcome: 'direct' },
  {
    id: 'inquisitorial_office',
    query: 'Inquisitorial office',
    outcome: 'discoverable',
    parent: 'inquisition',
  },
  {
    id: 'customs_service',
    query: 'Customs service',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },
  { id: 'private_security_company', query: 'Private security company', outcome: 'direct' },
  { id: 'marshals', query: 'Marshals', outcome: 'discoverable', parent: 'city_watch' },

  // 5. Religious (12)
  { id: 'church', query: 'Church', outcome: 'direct' },
  {
    id: 'temple_organization',
    query: 'Temple organization',
    outcome: 'discoverable',
    parent: 'church',
  },
  { id: 'religious_order', query: 'Religious order', outcome: 'direct' },
  { id: 'monastery', query: 'Monastery', outcome: 'discoverable', parent: 'religious_order' },
  {
    id: 'missionary_society',
    query: 'Missionary society',
    outcome: 'direct',
  },
  { id: 'cult', query: 'Cult', outcome: 'direct' },
  { id: 'diocese', query: 'Diocese', outcome: 'inappropriate' },
  { id: 'druid_circle', query: 'Druid circle', outcome: 'direct' },
  { id: 'shrine_keepers', query: 'Shrine keepers', outcome: 'inappropriate' },
  { id: 'heretical_sect', query: 'Heretical sect', outcome: 'discoverable', parent: 'church' },
  {
    id: 'pilgrimage_society',
    query: 'Pilgrimage society',
    outcome: 'discoverable',
    parent: 'church',
  },
  { id: 'pantheon_clergy', query: 'Pantheon clergy', outcome: 'inappropriate' },

  // 6. Commercial / trade (14)
  { id: 'trading_company', query: 'Trading company', outcome: 'direct' },
  {
    id: 'merchant_house',
    query: 'Merchant house',
    outcome: 'direct',
  },
  {
    id: 'merchant_guild',
    query: 'Merchant guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'market_association',
    query: 'Market association',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'caravan_company',
    query: 'Caravan company',
    outcome: 'direct',
  },
  {
    id: 'chartered_company',
    query: 'Chartered company',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'shopkeepers_association',
    query: 'Shopkeepers association',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'auction_house',
    query: 'Auction house',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  { id: 'spice_consortium', query: 'Spice consortium', outcome: 'inappropriate' },
  { id: 'factors_guild', query: 'Factors guild', outcome: 'discoverable', parent: 'craft_guild' },
  {
    id: 'company_of_merchant_adventurers',
    query: 'Company of merchant adventurers',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'warehouse_combine',
    query: 'Warehouse combine',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'bazaar_syndicate',
    query: 'Bazaar syndicate',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  { id: 'slave_trading_company', query: 'Slave-trading company', outcome: 'inappropriate' },

  // 7. Financial (6)
  { id: 'bank', query: 'Bank', outcome: 'direct' },
  { id: 'moneylenders', query: 'Moneylenders', outcome: 'discoverable', parent: 'bank' },
  { id: 'insurance_company', query: 'Insurance company', outcome: 'discoverable', parent: 'bank' },
  { id: 'mint', query: 'Mint', outcome: 'discoverable', parent: 'government_ministry' },
  { id: 'pawnbrokers', query: 'Pawnbrokers', outcome: 'discoverable', parent: 'bank' },
  { id: 'tax_farmers', query: 'Tax farmers', outcome: 'discoverable', parent: 'bank' },

  // 8. Occupational / guild (10)
  { id: 'craft_guild', query: 'Craft guild', outcome: 'direct' },
  { id: 'labor_union', query: 'Labor union', outcome: 'direct' },
  {
    id: 'professional_college',
    query: 'Professional college',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  { id: 'hunters_lodge', query: 'Hunters lodge', outcome: 'discoverable', parent: 'craft_guild' },
  { id: 'scribes_guild', query: 'Scribes guild', outcome: 'discoverable', parent: 'craft_guild' },
  {
    id: 'entertainers_guild',
    query: 'Entertainers guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'alchemists_guild',
    query: 'Alchemists guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'cartographers_guild',
    query: 'Cartographers guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  { id: 'pilots_guild', query: 'Pilots guild', outcome: 'discoverable', parent: 'craft_guild' },
  {
    id: 'advocates_guild',
    query: 'Advocates guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },

  // 9. Industrial / production (6)
  {
    id: 'foundry_works',
    query: 'Foundry works',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'textile_manufactory',
    query: 'Textile manufactory',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'millers_cooperative',
    query: 'Millers cooperative',
    outcome: 'discoverable',
    parent: 'farming_cooperative',
  },
  { id: 'shipyard', query: 'Shipyard', outcome: 'direct' },
  {
    id: 'brewery_company',
    query: 'Brewery company',
    outcome: 'discoverable',
    parent: 'brewery',
  },
  { id: 'glassworks', query: 'Glassworks', outcome: 'discoverable', parent: 'trading_company' },

  // 10. Academic / scholarly (10)
  { id: 'academy', query: 'Academy', outcome: 'direct' },
  { id: 'university', query: 'University', outcome: 'direct' },
  { id: 'scholarly_society', query: 'Scholarly society', outcome: 'direct' },
  { id: 'mage_college', query: 'Mage college', outcome: 'direct' },
  {
    id: 'research_institute',
    query: 'Research institute',
    outcome: 'discoverable',
    parent: 'scholarly_society',
  },
  {
    id: 'guild_of_scholars',
    query: 'Guild of scholars',
    outcome: 'discoverable',
    parent: 'scholarly_society',
  },
  { id: 'great_library', query: 'Great library', outcome: 'inappropriate' },
  { id: 'observatory', query: 'Observatory', outcome: 'inappropriate' },
  { id: 'seminary', query: 'Seminary', outcome: 'discoverable', parent: 'academy' },
  { id: 'bardic_college', query: 'Bardic college', outcome: 'discoverable', parent: 'academy' },

  // 11. Medical (5)
  { id: 'hospital_order', query: 'Hospital order', outcome: 'direct' },
  {
    id: 'apothecaries_guild',
    query: 'Apothecaries guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  {
    id: 'surgeons_college',
    query: 'Surgeons college',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  { id: 'plague_wardens', query: 'Plague wardens', outcome: 'inappropriate' },
  {
    id: 'hospice_society',
    query: 'Hospice society',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },

  // 12. Charitable / civic / social / cultural (12)
  { id: 'charitable_foundation', query: 'Charitable foundation', outcome: 'direct' },
  {
    id: 'orphanage_society',
    query: 'Orphanage society',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  {
    id: 'famine_relief_society',
    query: 'Famine relief society',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  {
    id: 'burial_society',
    query: 'Burial society',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  {
    id: 'civic_league',
    query: 'Civic league',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  { id: 'mutual_aid_society', query: 'Mutual aid society', outcome: 'direct' },
  { id: 'theater_troupe', query: 'Theater troupe', outcome: 'direct' },
  {
    id: 'museum_society',
    query: 'Museum society',
    outcome: 'discoverable',
    parent: 'scholarly_society',
  },
  {
    id: 'festival_guild',
    query: 'Festival guild',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  {
    id: 'sporting_club',
    query: 'Sporting club',
    outcome: 'discoverable',
    parent: 'mutual_aid_society',
  },
  { id: 'fraternal_lodge', query: 'Fraternal lodge', outcome: 'direct' },
  { id: 'clan', query: 'Clan', outcome: 'inappropriate' },

  // 13. Criminal / clandestine (12)
  { id: 'thieves_guild', query: "Thieves' guild", outcome: 'direct' },
  { id: 'gang', query: 'Gang', outcome: 'direct' },
  { id: 'smuggling_ring', query: 'Smuggling ring', outcome: 'direct' },
  {
    id: 'criminal_syndicate',
    query: 'Criminal syndicate',
    outcome: 'discoverable',
    parent: 'smuggling_ring',
  },
  { id: 'pirate_crew', query: 'Pirate crew', outcome: 'direct' },
  { id: 'assassins_order', query: "Assassins' order", outcome: 'direct' },
  {
    id: 'fencing_network',
    query: 'Fencing network',
    outcome: 'direct',
  },
  {
    id: 'counterfeiting_ring',
    query: 'Counterfeiting ring',
    outcome: 'direct',
  },
  { id: 'protection_racket', query: 'Protection racket', outcome: 'direct' },
  { id: 'wreckers', query: 'Wreckers', outcome: 'discoverable', parent: 'gang' },
  { id: 'prison_gang', query: 'Prison gang', outcome: 'discoverable', parent: 'gang' },
  {
    id: 'beggars_guild',
    query: "Beggars' guild",
    outcome: 'discoverable',
    parent: 'thieves_guild',
  },

  // 14. Mercenary / adventuring / exploratory (8)
  { id: 'mercenary_company', query: 'Mercenary company', outcome: 'direct' },
  {
    id: 'adventuring_company',
    query: 'Adventuring company',
    outcome: 'discoverable',
    parent: 'adventurers_guild',
  },
  { id: 'adventurers_guild', query: "Adventurers' guild", outcome: 'direct' },
  {
    id: 'explorers_society',
    query: "Explorers' society",
    outcome: 'direct',
  },
  {
    id: 'monster_hunters_guild',
    query: "Monster hunters' guild",
    outcome: 'discoverable',
    parent: 'adventurers_guild',
  },
  {
    id: 'treasure_hunters',
    query: 'Treasure hunters',
    outcome: 'discoverable',
    parent: 'adventurers_guild',
  },
  {
    id: 'ranger_company',
    query: 'Ranger company',
    outcome: 'discoverable',
    parent: 'mercenary_company',
  },
  { id: 'survey_expedition', query: 'Survey expedition', outcome: 'inappropriate' },

  // 15. Transportation / shipping (6)
  { id: 'shipping_company', query: 'Shipping company', outcome: 'direct' },
  {
    id: 'teamsters_guild',
    query: 'Teamsters guild',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  { id: 'coach_line', query: 'Coach line', outcome: 'discoverable', parent: 'shipping_company' },
  { id: 'river_boatmen', query: 'River boatmen', outcome: 'discoverable', parent: 'craft_guild' },
  {
    id: 'courier_service',
    query: 'Courier service',
    outcome: 'discoverable',
    parent: 'shipping_company',
  },
  {
    id: 'postal_service',
    query: 'Postal service',
    outcome: 'discoverable',
    parent: 'government_ministry',
  },

  // 16. Agriculture / resource extraction (5)
  {
    id: 'farming_cooperative',
    query: 'Farming cooperative',
    outcome: 'direct',
  },
  {
    id: 'logging_company',
    query: 'Logging company',
    outcome: 'direct',
  },
  {
    id: 'fishing_fleet',
    query: 'Fishing fleet',
    outcome: 'discoverable',
    parent: 'trading_company',
  },
  {
    id: 'ranchers_association',
    query: 'Ranchers association',
    outcome: 'discoverable',
    parent: 'craft_guild',
  },
  { id: 'fur_company', query: 'Fur company', outcome: 'discoverable', parent: 'trading_company' },

  // 17. Secret societies (4)
  { id: 'secret_society', query: 'Secret society', outcome: 'no_start' },
  { id: 'wizard_circle', query: 'Wizard circle', outcome: 'discoverable', parent: 'academy' },
  { id: 'witches_coven', query: "Witches' coven", outcome: 'discoverable', parent: 'cult' },
  { id: 'conspiracy_cabal', query: 'Conspiracy cabal', outcome: 'no_start' },
] as const satisfies readonly OrganizationPresetCoverageRow[]
