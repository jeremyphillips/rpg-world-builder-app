#!/usr/bin/env node
/**
 * Derives preset-title NPC recommendations and writes
 * tools/scripts/organization-preset-npc-recommendations.mjs
 *
 * Run: node tools/scripts/build-organization-preset-npc-recommendations.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GENERATOR_PATH = path.join(__dirname, 'generate-organization-membership-title-data.mjs')
const OUTPUT_PATH = path.join(__dirname, 'organization-preset-npc-recommendations.mjs')

/** @type {readonly string[]} */
const NPC_AUTHORING_TEMPLATE_IDS = [
  'civilian',
  'manual_worker',
  'artisan',
  'merchant',
  'administrator',
  'civic_leader',
  'scholar',
  'technical_specialist',
  'healer',
  'performer',
  'maritime_crew',
  'maritime_officer',
  'guard',
  'scout',
  'investigator',
  'covert_operator',
  'martial_specialist',
  'martial_officer',
  'martial_commander',
  'arcane_practitioner',
  'divine_practitioner',
  'nature_practitioner',
]

/** @type {Record<string, 'military' | 'maritime' | 'criminal' | 'intelligence' | 'academic' | 'arcane' | 'religious' | 'nature' | 'commercial' | 'government' | 'occupational' | 'adventuring' | 'medical' | 'arts' | 'law'>} */
const PRESET_KIND = {
  academy: 'academic',
  university: 'academic',
  scholarly_society: 'academic',
  explorers_society: 'academic',
  mage_college: 'arcane',
  church: 'religious',
  religious_order: 'religious',
  cult: 'religious',
  missionary_society: 'religious',
  druid_circle: 'nature',
  hospital_order: 'medical',
  army: 'military',
  navy: 'maritime',
  militia: 'military',
  mercenary_company: 'military',
  knightly_order: 'military',
  city_watch: 'law',
  bounty_hunters: 'law',
  inquisition: 'law',
  private_security_company: 'law',
  intelligence_bureau: 'intelligence',
  spy_ring: 'intelligence',
  thieves_guild: 'criminal',
  gang: 'criminal',
  smuggling_ring: 'criminal',
  counterfeiting_ring: 'criminal',
  fencing_network: 'criminal',
  protection_racket: 'criminal',
  assassins_order: 'criminal',
  adventurers_guild: 'adventuring',
  bank: 'commercial',
  trading_company: 'commercial',
  merchant_house: 'commercial',
  shipping_company: 'maritime',
  caravan_company: 'commercial',
  mining_company: 'occupational',
  logging_company: 'occupational',
  shipyard: 'occupational',
  brewery: 'occupational',
  farming_cooperative: 'occupational',
  craft_guild: 'occupational',
  city_council: 'government',
  government_ministry: 'government',
  political_party: 'government',
  labor_union: 'government',
  charitable_foundation: 'government',
  mutual_aid_society: 'government',
  fraternal_lodge: 'government',
  theater_troupe: 'arts',
}

/** Explicit preset:title overrides — highest precedence. */
/** @type {Record<string, { templateId: string, level: number }>} */
const EXPLICIT = {
  // Plan examples
  'brewery:proprietor': { templateId: 'civic_leader', level: 0 },
  'brewery:brewmaster': { templateId: 'artisan', level: 0 },
  'army:soldier': { templateId: 'guard', level: 2 },
  'army:lieutenant': { templateId: 'martial_officer', level: 6 },
  'thieves_guild:enforcer': { templateId: 'martial_specialist', level: 5 },
  'thieves_guild:operative': { templateId: 'covert_operator', level: 4 },
  'thieves_guild:master_thief': { templateId: 'covert_operator', level: 9 },
  'mage_college:archmage': { templateId: 'arcane_practitioner', level: 14 },

  // Contextual leadership / rank titles
  'army:general': { templateId: 'martial_commander', level: 14 },
  'army:marshal': { templateId: 'martial_commander', level: 13 },
  'army:commander': { templateId: 'martial_commander', level: 10 },
  'army:captain': { templateId: 'martial_officer', level: 6 },
  'army:sergeant': { templateId: 'martial_specialist', level: 4 },
  'army:recruit': { templateId: 'guard', level: 1 },

  'navy:admiral': { templateId: 'martial_commander', level: 14 },
  'navy:commodore': { templateId: 'martial_commander', level: 11 },
  'navy:captain': { templateId: 'maritime_officer', level: 7 },
  'navy:lieutenant': { templateId: 'maritime_officer', level: 5 },
  'navy:sailing_master': { templateId: 'technical_specialist', level: 5 },
  'navy:boatswain': { templateId: 'maritime_crew', level: 3 },
  'navy:sailor': { templateId: 'maritime_crew', level: 2 },
  'navy:marine': { templateId: 'guard', level: 3 },

  'mercenary_company:captain': { templateId: 'martial_officer', level: 7 },
  'mercenary_company:commander': { templateId: 'martial_commander', level: 9 },
  'mercenary_company:lieutenant': { templateId: 'martial_officer', level: 5 },
  'mercenary_company:sergeant': { templateId: 'martial_specialist', level: 4 },
  'mercenary_company:mercenary': { templateId: 'martial_specialist', level: 4 },
  'mercenary_company:scout': { templateId: 'scout', level: 3 },
  'mercenary_company:recruit': { templateId: 'guard', level: 1 },

  'city_watch:watch_commander': { templateId: 'martial_commander', level: 9 },
  'city_watch:captain': { templateId: 'martial_officer', level: 6 },
  'city_watch:marshal': { templateId: 'martial_commander', level: 10 },
  'city_watch:lieutenant': { templateId: 'martial_officer', level: 5 },
  'city_watch:sergeant': { templateId: 'martial_specialist', level: 4 },
  'city_watch:investigator': { templateId: 'investigator', level: 4 },
  'city_watch:detective': { templateId: 'investigator', level: 5 },
  'city_watch:constable': { templateId: 'guard', level: 2 },

  'militia:commander': { templateId: 'martial_commander', level: 7 },
  'militia:captain': { templateId: 'martial_officer', level: 5 },
  'militia:lieutenant': { templateId: 'martial_officer', level: 4 },
  'militia:sergeant': { templateId: 'martial_specialist', level: 3 },
  'militia:militiaman': { templateId: 'guard', level: 2 },
  'militia:scout': { templateId: 'scout', level: 2 },
  'militia:recruit': { templateId: 'guard', level: 1 },

  'knightly_order:grand_master': { templateId: 'martial_commander', level: 12 },
  'knightly_order:knight_commander': { templateId: 'martial_commander', level: 10 },
  'knightly_order:knight_captain': { templateId: 'martial_officer', level: 7 },
  'knightly_order:knight': { templateId: 'martial_specialist', level: 5 },
  'knightly_order:sergeant': { templateId: 'martial_specialist', level: 4 },
  'knightly_order:squire': { templateId: 'guard', level: 2 },
  'knightly_order:initiate': { templateId: 'guard', level: 1 },

  'adventurers_guild:guildmaster': { templateId: 'martial_commander', level: 8 },
  'adventurers_guild:captain': { templateId: 'martial_officer', level: 6 },
  'adventurers_guild:quartermaster': { templateId: 'administrator', level: 3 },
  'adventurers_guild:veteran': { templateId: 'martial_specialist', level: 5 },
  'adventurers_guild:adventurer': { templateId: 'martial_specialist', level: 3 },
  'adventurers_guild:scout': { templateId: 'scout', level: 3 },
  'adventurers_guild:member': { templateId: 'martial_specialist', level: 2 },
  'adventurers_guild:recruit': { templateId: 'guard', level: 1 },

  'thieves_guild:guildmaster': { templateId: 'covert_operator', level: 9 },
  'thieves_guild:lieutenant': { templateId: 'covert_operator', level: 6 },
  'thieves_guild:cutpurse': { templateId: 'covert_operator', level: 2 },
  'thieves_guild:member': { templateId: 'covert_operator', level: 2 },
  'thieves_guild:apprentice': { templateId: 'covert_operator', level: 1 },

  'assassins_order:grandmaster': { templateId: 'covert_operator', level: 12 },
  'assassins_order:master_assassin': { templateId: 'covert_operator', level: 9 },
  'assassins_order:handler': { templateId: 'covert_operator', level: 6 },
  'assassins_order:assassin': { templateId: 'covert_operator', level: 5 },
  'assassins_order:operative': { templateId: 'covert_operator', level: 4 },
  'assassins_order:agent': { templateId: 'covert_operator', level: 3 },
  'assassins_order:initiate': { templateId: 'covert_operator', level: 1 },

  'spy_ring:spymaster': { templateId: 'covert_operator', level: 10 },
  'spy_ring:handler': { templateId: 'covert_operator', level: 6 },
  'spy_ring:case_officer': { templateId: 'covert_operator', level: 5 },
  'spy_ring:agent': { templateId: 'covert_operator', level: 4 },
  'spy_ring:operative': { templateId: 'covert_operator', level: 4 },
  'spy_ring:courier': { templateId: 'covert_operator', level: 2 },
  'spy_ring:informant': { templateId: 'civilian', level: 0 },

  'intelligence_bureau:director': { templateId: 'covert_operator', level: 10 },
  'intelligence_bureau:deputy_director': { templateId: 'administrator', level: 8 },
  'intelligence_bureau:spymaster': { templateId: 'covert_operator', level: 9 },
  'intelligence_bureau:handler': { templateId: 'covert_operator', level: 6 },
  'intelligence_bureau:analyst': { templateId: 'scholar', level: 3 },
  'intelligence_bureau:agent': { templateId: 'covert_operator', level: 4 },
  'intelligence_bureau:operative': { templateId: 'covert_operator', level: 4 },
  'intelligence_bureau:informant': { templateId: 'civilian', level: 0 },

  'mage_college:rector': { templateId: 'arcane_practitioner', level: 10 },
  'mage_college:master': { templateId: 'arcane_practitioner', level: 9 },
  'mage_college:professor': { templateId: 'arcane_practitioner', level: 6 },
  'mage_college:mage': { templateId: 'arcane_practitioner', level: 4 },
  'mage_college:researcher': { templateId: 'scholar', level: 3 },
  'mage_college:adept': { templateId: 'arcane_practitioner', level: 2 },
  'mage_college:apprentice': { templateId: 'arcane_practitioner', level: 1 },

  'druid_circle:archdruid': { templateId: 'nature_practitioner', level: 14 },
  'druid_circle:elder_druid': { templateId: 'nature_practitioner', level: 10 },
  'druid_circle:druid': { templateId: 'nature_practitioner', level: 5 },
  'druid_circle:warden': { templateId: 'nature_practitioner', level: 4 },
  'druid_circle:keeper': { templateId: 'nature_practitioner', level: 3 },
  'druid_circle:acolyte': { templateId: 'nature_practitioner', level: 1 },
  'druid_circle:initiate': { templateId: 'nature_practitioner', level: 1 },

  'church:high_priest': { templateId: 'divine_practitioner', level: 10 },
  'church:priest': { templateId: 'divine_practitioner', level: 5 },
  'church:elder': { templateId: 'divine_practitioner', level: 6 },
  'church:minister': { templateId: 'divine_practitioner', level: 4 },
  'church:deacon': { templateId: 'administrator', level: 2 },
  'church:cleric': { templateId: 'divine_practitioner', level: 3 },
  'church:acolyte': { templateId: 'divine_practitioner', level: 1 },
  'church:congregant': { templateId: 'civilian', level: 0 },

  'bank:treasurer': { templateId: 'administrator', level: 3 },
  'bank:proprietor': { templateId: 'civic_leader', level: 0 },
  'bank:banker': { templateId: 'merchant', level: 2 },
  'bank:manager': { templateId: 'administrator', level: 2 },
  'bank:cashier': { templateId: 'administrator', level: 0 },
  'bank:accountant': { templateId: 'administrator', level: 1 },
  'bank:clerk': { templateId: 'administrator', level: 0 },

  'shipping_company:proprietor': { templateId: 'civic_leader', level: 0 },
  'shipping_company:shipping_master': { templateId: 'administrator', level: 4 },
  'shipping_company:captain': { templateId: 'maritime_officer', level: 6 },
  'shipping_company:dispatcher': { templateId: 'administrator', level: 2 },
  'shipping_company:navigator': { templateId: 'technical_specialist', level: 4 },
  'shipping_company:courier': { templateId: 'manual_worker', level: 0 },
  'shipping_company:crew': { templateId: 'maritime_crew', level: 2 },
  'shipping_company:clerk': { templateId: 'administrator', level: 0 },

  'pirate_crew:captain': { templateId: 'maritime_officer', level: 7 },
  'pirate_crew:quartermaster': { templateId: 'administrator', level: 4 },
  'pirate_crew:sailing_master': { templateId: 'technical_specialist', level: 5 },
  'pirate_crew:boatswain': { templateId: 'maritime_crew', level: 3 },
  'pirate_crew:gunner': { templateId: 'martial_specialist', level: 4 },
  'pirate_crew:pirate': { templateId: 'martial_specialist', level: 3 },
  'pirate_crew:sailor': { templateId: 'maritime_crew', level: 2 },
  'pirate_crew:cabin_hand': { templateId: 'maritime_crew', level: 1 },

  'private_security_company:director': { templateId: 'administrator', level: 8 },
  'private_security_company:security_chief': { templateId: 'martial_commander', level: 8 },
  'private_security_company:captain': { templateId: 'martial_officer', level: 6 },
  'private_security_company:supervisor': { templateId: 'martial_officer', level: 4 },
  'private_security_company:bodyguard': { templateId: 'martial_specialist', level: 5 },
  'private_security_company:guard': { templateId: 'guard', level: 3 },
  'private_security_company:investigator': { templateId: 'investigator', level: 4 },
  'private_security_company:recruit': { templateId: 'guard', level: 1 },
  'bounty_hunters:guildmaster': { templateId: 'martial_officer', level: 8 },
  'hospital_order:grand_master': { templateId: 'divine_practitioner', level: 10 },
}

/** @type {Record<string, { templateId: string, level: number }>} */
const TITLE_DEFAULTS = {
  abbot: { templateId: 'divine_practitioner', level: 8 },
  accountant: { templateId: 'administrator', level: 1 },
  acolyte: { templateId: 'divine_practitioner', level: 1 },
  actor: { templateId: 'performer', level: 2 },
  adept: { templateId: 'arcane_practitioner', level: 2 },
  administrator: { templateId: 'administrator', level: 2 },
  admiral: { templateId: 'martial_commander', level: 14 },
  adventurer: { templateId: 'martial_specialist', level: 3 },
  agent: { templateId: 'covert_operator', level: 3 },
  analyst: { templateId: 'scholar', level: 3 },
  apprentice: { templateId: 'artisan', level: 1 },
  archdruid: { templateId: 'nature_practitioner', level: 14 },
  archivist: { templateId: 'scholar', level: 2 },
  archmage: { templateId: 'arcane_practitioner', level: 14 },
  artisan: { templateId: 'artisan', level: 2 },
  assassin: { templateId: 'covert_operator', level: 5 },
  banker: { templateId: 'merchant', level: 2 },
  benefactor: { templateId: 'civic_leader', level: 0 },
  boatswain: { templateId: 'maritime_crew', level: 3 },
  bodyguard: { templateId: 'martial_specialist', level: 5 },
  boss: { templateId: 'civic_leader', level: 8 },
  bounty_hunter: { templateId: 'martial_specialist', level: 5 },
  brewer: { templateId: 'artisan', level: 1 },
  brewmaster: { templateId: 'artisan', level: 3 },
  broker: { templateId: 'merchant', level: 2 },
  brother: { templateId: 'civilian', level: 0 },
  buyer: { templateId: 'merchant', level: 1 },
  cabin_hand: { templateId: 'maritime_crew', level: 1 },
  captain: { templateId: 'martial_officer', level: 6 },
  caravan_master: { templateId: 'administrator', level: 4 },
  carpenter: { templateId: 'artisan', level: 1 },
  cartographer: { templateId: 'scholar', level: 2 },
  case_officer: { templateId: 'covert_operator', level: 5 },
  cashier: { templateId: 'administrator', level: 0 },
  cellarer: { templateId: 'manual_worker', level: 0 },
  chair: { templateId: 'civic_leader', level: 0 },
  chancellor: { templateId: 'civic_leader', level: 0 },
  chief_cartographer: { templateId: 'scholar', level: 6 },
  chief_surveyor: { templateId: 'technical_specialist', level: 6 },
  cleric: { templateId: 'divine_practitioner', level: 3 },
  clerk: { templateId: 'administrator', level: 0 },
  collector: { templateId: 'martial_specialist', level: 3 },
  commander: { templateId: 'martial_commander', level: 10 },
  commissioner: { templateId: 'administrator', level: 6 },
  commodore: { templateId: 'martial_commander', level: 11 },
  company_manager: { templateId: 'administrator', level: 3 },
  congregant: { templateId: 'civilian', level: 0 },
  constable: { templateId: 'guard', level: 2 },
  cooper: { templateId: 'artisan', level: 1 },
  coordinator: { templateId: 'administrator', level: 1 },
  courier: { templateId: 'manual_worker', level: 0 },
  crew: { templateId: 'maritime_crew', level: 2 },
  cutpurse: { templateId: 'covert_operator', level: 2 },
  dean: { templateId: 'administrator', level: 4 },
  delegate: { templateId: 'administrator', level: 1 },
  deputy_director: { templateId: 'administrator', level: 8 },
  detective: { templateId: 'investigator', level: 5 },
  devotee: { templateId: 'civilian', level: 0 },
  director: { templateId: 'administrator', level: 6 },
  dispatcher: { templateId: 'administrator', level: 2 },
  doctor: { templateId: 'healer', level: 5 },
  drover: { templateId: 'manual_worker', level: 0 },
  driver: { templateId: 'manual_worker', level: 0 },
  druid: { templateId: 'nature_practitioner', level: 5 },
  elder: { templateId: 'civic_leader', level: 5 },
  elder_druid: { templateId: 'nature_practitioner', level: 10 },
  engraver: { templateId: 'artisan', level: 2 },
  enforcer: { templateId: 'martial_specialist', level: 5 },
  engineer: { templateId: 'technical_specialist', level: 4 },
  examiner: { templateId: 'investigator', level: 4 },
  explorer: { templateId: 'scout', level: 3 },
  factor: { templateId: 'merchant', level: 3 },
  farm_manager: { templateId: 'administrator', level: 2 },
  farmer: { templateId: 'manual_worker', level: 0 },
  fellow: { templateId: 'scholar', level: 2 },
  fence: { templateId: 'merchant', level: 3 },
  fixer: { templateId: 'covert_operator', level: 4 },
  foreman: { templateId: 'administrator', level: 3 },
  forger: { templateId: 'artisan', level: 3 },
  general: { templateId: 'martial_commander', level: 14 },
  grand_inquisitor: { templateId: 'investigator', level: 12 },
  grand_master: { templateId: 'civic_leader', level: 10 },
  grandmaster: { templateId: 'civic_leader', level: 10 },
  grower: { templateId: 'manual_worker', level: 0 },
  guard: { templateId: 'guard', level: 3 },
  guide: { templateId: 'scout', level: 3 },
  guild_steward: { templateId: 'administrator', level: 3 },
  guildmaster: { templateId: 'civic_leader', level: 8 },
  gunner: { templateId: 'martial_specialist', level: 4 },
  handler: { templateId: 'covert_operator', level: 5 },
  healer: { templateId: 'healer', level: 4 },
  hierophant: { templateId: 'divine_practitioner', level: 8 },
  high_inquisitor: { templateId: 'investigator', level: 9 },
  high_priest: { templateId: 'divine_practitioner', level: 10 },
  hospitaller: { templateId: 'healer', level: 3 },
  huntmaster: { templateId: 'martial_officer', level: 7 },
  informant: { templateId: 'civilian', level: 0 },
  initiate: { templateId: 'guard', level: 1 },
  inquisitor: { templateId: 'investigator', level: 6 },
  inspector: { templateId: 'investigator', level: 4 },
  instructor: { templateId: 'scholar', level: 2 },
  interrogator: { templateId: 'investigator', level: 4 },
  investigator: { templateId: 'investigator', level: 4 },
  journeyman: { templateId: 'artisan', level: 2 },
  keeper: { templateId: 'administrator', level: 2 },
  knight: { templateId: 'martial_specialist', level: 5 },
  knight_captain: { templateId: 'martial_officer', level: 7 },
  knight_commander: { templateId: 'martial_commander', level: 10 },
  laborer: { templateId: 'manual_worker', level: 0 },
  lay_worker: { templateId: 'civilian', level: 0 },
  lead_actor: { templateId: 'performer', level: 4 },
  lecturer: { templateId: 'scholar', level: 2 },
  lieutenant: { templateId: 'martial_officer', level: 6 },
  logger: { templateId: 'manual_worker', level: 1 },
  lookout: { templateId: 'scout', level: 2 },
  manager: { templateId: 'administrator', level: 2 },
  marine: { templateId: 'guard', level: 3 },
  marshal: { templateId: 'martial_commander', level: 13 },
  master: { templateId: 'artisan', level: 4 },
  master_artisan: { templateId: 'artisan', level: 5 },
  master_assassin: { templateId: 'covert_operator', level: 9 },
  master_fence: { templateId: 'merchant', level: 5 },
  master_forger: { templateId: 'artisan', level: 6 },
  master_healer: { templateId: 'healer', level: 8 },
  master_thief: { templateId: 'covert_operator', level: 9 },
  mate: { templateId: 'maritime_crew', level: 3 },
  matriarch: { templateId: 'civic_leader', level: 0 },
  member: { templateId: 'civilian', level: 0 },
  mercenary: { templateId: 'martial_specialist', level: 4 },
  merchant: { templateId: 'merchant', level: 0 },
  militiaman: { templateId: 'guard', level: 2 },
  mine_captain: { templateId: 'administrator', level: 5 },
  miner: { templateId: 'manual_worker', level: 1 },
  minister: { templateId: 'administrator', level: 6 },
  missionary: { templateId: 'divine_practitioner', level: 2 },
  mission_director: { templateId: 'administrator', level: 6 },
  musician: { templateId: 'performer', level: 2 },
  navigator: { templateId: 'technical_specialist', level: 4 },
  novice: { templateId: 'divine_practitioner', level: 1 },
  officer: { templateId: 'administrator', level: 2 },
  operative: { templateId: 'covert_operator', level: 4 },
  oracle: { templateId: 'divine_practitioner', level: 6 },
  organizer: { templateId: 'administrator', level: 2 },
  party_leader: { templateId: 'civic_leader', level: 8 },
  passer: { templateId: 'covert_operator', level: 2 },
  patriarch: { templateId: 'civic_leader', level: 0 },
  physician: { templateId: 'healer', level: 5 },
  pirate: { templateId: 'martial_specialist', level: 3 },
  playwright: { templateId: 'performer', level: 3 },
  preacher: { templateId: 'divine_practitioner', level: 2 },
  president: { templateId: 'civic_leader', level: 0 },
  priest: { templateId: 'divine_practitioner', level: 5 },
  prior: { templateId: 'administrator', level: 6 },
  printer: { templateId: 'artisan', level: 2 },
  professor: { templateId: 'scholar', level: 4 },
  prospector: { templateId: 'manual_worker', level: 2 },
  proprietor: { templateId: 'civic_leader', level: 0 },
  quartermaster: { templateId: 'administrator', level: 3 },
  recruiter: { templateId: 'administrator', level: 2 },
  recruit: { templateId: 'guard', level: 1 },
  rector: { templateId: 'civic_leader', level: 0 },
  representative: { templateId: 'administrator', level: 1 },
  researcher: { templateId: 'scholar', level: 2 },
  rigger: { templateId: 'manual_worker', level: 1 },
  ringleader: { templateId: 'civic_leader', level: 8 },
  runner: { templateId: 'manual_worker', level: 0 },
  sailing_master: { templateId: 'technical_specialist', level: 5 },
  sailor: { templateId: 'maritime_crew', level: 2 },
  sawyer: { templateId: 'artisan', level: 1 },
  scholar: { templateId: 'scholar', level: 2 },
  scout: { templateId: 'scout', level: 3 },
  secretary: { templateId: 'administrator', level: 3 },
  senator: { templateId: 'civic_leader', level: 4 },
  sergeant: { templateId: 'martial_specialist', level: 4 },
  shipwright: { templateId: 'artisan', level: 3 },
  shipwright_master: { templateId: 'artisan', level: 6 },
  shipping_master: { templateId: 'administrator', level: 4 },
  shop_steward: { templateId: 'administrator', level: 2 },
  singer: { templateId: 'performer', level: 2 },
  sister: { templateId: 'civilian', level: 0 },
  smuggler: { templateId: 'covert_operator', level: 4 },
  soldier: { templateId: 'guard', level: 2 },
  speaker: { templateId: 'civic_leader', level: 0 },
  spymaster: { templateId: 'covert_operator', level: 9 },
  squire: { templateId: 'guard', level: 2 },
  stagehand: { templateId: 'manual_worker', level: 0 },
  steward: { templateId: 'administrator', level: 2 },
  student: { templateId: 'scholar', level: 0 },
  supervisor: { templateId: 'administrator', level: 3 },
  surgeon: { templateId: 'healer', level: 6 },
  surveyor: { templateId: 'technical_specialist', level: 3 },
  teamster: { templateId: 'manual_worker', level: 1 },
  timber_master: { templateId: 'administrator', level: 4 },
  tracker: { templateId: 'scout', level: 4 },
  translator: { templateId: 'scholar', level: 2 },
  treasurer: { templateId: 'administrator', level: 3 },
  trustee: { templateId: 'civic_leader', level: 0 },
  veteran: { templateId: 'martial_specialist', level: 5 },
  volunteer: { templateId: 'civilian', level: 0 },
  warden: { templateId: 'administrator', level: 3 },
  watch_commander: { templateId: 'martial_commander', level: 9 },
  yardmaster: { templateId: 'administrator', level: 4 },
}

/**
 * @param {string} presetId
 * @param {string} titleId
 * @returns {{ templateId: string, level: number }}
 */
function resolveRecommendation(presetId, titleId) {
  const key = `${presetId}:${titleId}`
  if (EXPLICIT[key]) return EXPLICIT[key]

  const kind = PRESET_KIND[presetId] ?? 'occupational'
  const base = TITLE_DEFAULTS[titleId]
  if (!base) {
    return { templateId: 'civilian', level: 0 }
  }

  /** @type {{ templateId: string, level: number }} */
  let rec = { ...base }

  // Kind-aware adjustments for ambiguous shared titles
  if (titleId === 'captain') {
    rec =
      kind === 'maritime'
        ? { templateId: 'maritime_officer', level: 6 }
        : kind === 'military' || kind === 'law' || kind === 'adventuring'
          ? { templateId: 'martial_officer', level: 6 }
          : { templateId: 'administrator', level: 4 }
  } else if (titleId === 'director') {
    rec =
      kind === 'intelligence' || kind === 'law'
        ? { templateId: 'administrator', level: 8 }
        : kind === 'arts'
          ? { templateId: 'performer', level: 5 }
          : { templateId: 'administrator', level: 6 }
  } else if (titleId === 'agent') {
    rec =
      kind === 'criminal' || kind === 'intelligence'
        ? { templateId: 'covert_operator', level: 4 }
        : kind === 'commercial'
          ? { templateId: 'merchant', level: 2 }
          : { templateId: 'administrator', level: 2 }
  } else if (titleId === 'member') {
    rec =
      kind === 'criminal'
        ? { templateId: 'covert_operator', level: 2 }
        : kind === 'adventuring'
          ? { templateId: 'martial_specialist', level: 2 }
          : kind === 'military'
            ? { templateId: 'guard', level: 2 }
            : { templateId: 'civilian', level: 0 }
  } else if (titleId === 'lieutenant') {
    rec =
      kind === 'maritime'
        ? { templateId: 'maritime_officer', level: 5 }
        : kind === 'criminal'
          ? { templateId: 'covert_operator', level: 6 }
          : { templateId: 'martial_officer', level: 6 }
  } else if (titleId === 'master' && kind === 'arcane') {
    rec = { templateId: 'arcane_practitioner', level: 9 }
  } else if (titleId === 'mage') {
    rec = { templateId: 'arcane_practitioner', level: 4 }
  } else if (titleId === 'initiate') {
    rec =
      kind === 'religious'
        ? { templateId: 'divine_practitioner', level: 1 }
        : kind === 'nature'
          ? { templateId: 'nature_practitioner', level: 1 }
          : kind === 'criminal'
            ? { templateId: 'covert_operator', level: 1 }
            : { templateId: 'guard', level: 1 }
  } else if (titleId === 'apprentice') {
    rec =
      kind === 'arcane'
        ? { templateId: 'arcane_practitioner', level: 1 }
        : kind === 'occupational' || kind === 'commercial'
          ? { templateId: 'artisan', level: 1 }
          : kind === 'criminal'
            ? { templateId: 'covert_operator', level: 1 }
            : { templateId: 'artisan', level: 1 }
  } else if (titleId === 'grand_master' && kind === 'religious') {
    rec = { templateId: 'divine_practitioner', level: 12 }
  } else if (titleId === 'grand_master' && kind === 'medical') {
    rec = { templateId: 'divine_practitioner', level: 10 }
  } else if (titleId === 'grand_master' && kind === 'military') {
    rec = { templateId: 'martial_commander', level: 12 }
  } else if (titleId === 'guildmaster') {
    rec =
      kind === 'criminal'
        ? { templateId: 'covert_operator', level: 9 }
        : kind === 'adventuring'
          ? { templateId: 'martial_commander', level: 8 }
          : kind === 'law'
            ? { templateId: 'martial_officer', level: 8 }
            : rec
  } else if (titleId === 'boss' && kind === 'criminal') {
    rec = { templateId: 'covert_operator', level: 8 }
  } else if (titleId === 'ringleader' && kind === 'criminal') {
    rec = { templateId: 'covert_operator', level: 8 }
  } else if (titleId === 'elder' && kind === 'religious') {
    rec = { templateId: 'divine_practitioner', level: 5 }
  } else if (titleId === 'rector' && kind === 'arcane') {
    rec = { templateId: 'arcane_practitioner', level: 10 }
  } else if (titleId === 'director' && kind === 'intelligence') {
    rec = { templateId: 'covert_operator', level: 10 }
  }

  if (!NPC_AUTHORING_TEMPLATE_IDS.includes(rec.templateId)) {
    throw new Error(`Invalid templateId ${rec.templateId} for ${key}`)
  }
  if (rec.level < 0 || rec.level > 20) {
    throw new Error(`Invalid level ${rec.level} for ${key}`)
  }

  return rec
}

function labelToId(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function loadPresetMembershipTitles() {
  const src = fs.readFileSync(GENERATOR_PATH, 'utf8')
  const match = src.match(/const PRESET_MEMBERSHIP_TITLES = (\{[\s\S]*?\n\})/)
  if (!match) throw new Error('Could not parse PRESET_MEMBERSHIP_TITLES')
  return eval(`(${match[1]})`)
}

function main() {
  const PRESET_MEMBERSHIP_TITLES = loadPresetMembershipTitles()
  /** @type {Record<string, { templateId: string, level: number }>} */
  const recommendations = {}
  let count = 0

  for (const [presetId, titles] of Object.entries(PRESET_MEMBERSHIP_TITLES)) {
    for (const [label] of titles) {
      const titleId = labelToId(label)
      const key = `${presetId}:${titleId}`
      recommendations[key] = resolveRecommendation(presetId, titleId)
      count += 1
    }
  }

  const lines = Object.entries(recommendations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, rec]) => `  '${key}': { templateId: '${rec.templateId}', level: ${rec.level} },`)

  const output = `/** @generated by tools/scripts/build-organization-preset-npc-recommendations.mjs — do not edit by hand. */

/** Preset:titleId → contextual NPC recommendation. */
export const PRESET_TITLE_NPC_RECOMMENDATIONS = {
${lines.join('\n')}
}
`

  fs.writeFileSync(OUTPUT_PATH, output)
  console.log(`Wrote ${OUTPUT_PATH}`)
  console.log(`Recommendations: ${count}`)
}

main()
