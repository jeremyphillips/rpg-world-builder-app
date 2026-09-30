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
const NPC_TEMPLATE_IDS = [
  'commoner',
  'guard',
  'scout',
  'merchant',
  'artisan',
  'scholar',
  'priest',
  'criminal',
]

/** Title-owned tool preferences prepended for artisan roles. They narrow the trade; they do not add slots. */
const ARTISAN_TITLE_TOOL_PREFERENCES = {
  brewmaster: ['brewers-supplies'],
  brewer: ['brewers-supplies'],
  carpenter: ['carpenters-tools'],
  sawyer: ['carpenters-tools'],
  shipwright: ['carpenters-tools'],
  shipwright_master: ['carpenters-tools'],
}

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
  'brewery:proprietor': { templateId: 'commoner', level: 0 },
  'brewery:brewmaster': { templateId: 'artisan', level: 0 },
  'army:soldier': { templateId: 'guard', level: 2 },
  'army:lieutenant': {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'thieves_guild:enforcer': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'thieves_guild:operative': { templateId: 'criminal', level: 4 },
  'thieves_guild:master_thief': { templateId: 'criminal', level: 9 },
  'mage_college:archmage': {
    templateId: 'scholar',
    level: 14,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },

  // Contextual leadership / rank titles
  'army:general': {
    templateId: 'guard',
    level: 14,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'army:marshal': {
    templateId: 'guard',
    level: 13,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'army:commander': {
    templateId: 'guard',
    level: 10,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'army:captain': {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'army:sergeant': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'army:recruit': { templateId: 'guard', level: 1 },

  'navy:admiral': {
    templateId: 'guard',
    level: 14,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'navy:commodore': {
    templateId: 'guard',
    level: 11,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'navy:captain': { templateId: 'guard', level: 7 },
  'navy:lieutenant': { templateId: 'guard', level: 5 },
  'navy:sailing_master': { templateId: 'scout', level: 5 },
  'navy:boatswain': { templateId: 'commoner', level: 3 },
  'navy:sailor': { templateId: 'commoner', level: 2 },
  'navy:marine': { templateId: 'guard', level: 3 },

  'mercenary_company:captain': {
    templateId: 'guard',
    level: 7,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'mercenary_company:commander': {
    templateId: 'guard',
    level: 9,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'mercenary_company:lieutenant': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'mercenary_company:sergeant': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'mercenary_company:mercenary': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'mercenary_company:scout': { templateId: 'scout', level: 3 },
  'mercenary_company:recruit': { templateId: 'guard', level: 1 },

  'city_watch:watch_commander': {
    templateId: 'guard',
    level: 9,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'city_watch:captain': {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'city_watch:marshal': {
    templateId: 'guard',
    level: 10,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'city_watch:lieutenant': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'city_watch:sergeant': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'city_watch:investigator': { templateId: 'criminal', level: 4 },
  'city_watch:detective': { templateId: 'criminal', level: 5 },
  'city_watch:constable': { templateId: 'guard', level: 2 },

  'militia:commander': {
    templateId: 'guard',
    level: 7,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'militia:captain': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'militia:lieutenant': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'militia:sergeant': {
    templateId: 'guard',
    level: 3,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'militia:militiaman': { templateId: 'guard', level: 2 },
  'militia:scout': { templateId: 'scout', level: 2 },
  'militia:recruit': { templateId: 'guard', level: 1 },

  'knightly_order:grand_master': {
    templateId: 'guard',
    level: 12,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'knightly_order:knight_commander': {
    templateId: 'guard',
    level: 10,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'knightly_order:knight_captain': {
    templateId: 'guard',
    level: 7,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'knightly_order:knight': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'knightly_order:sergeant': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'knightly_order:squire': { templateId: 'guard', level: 2 },
  'knightly_order:initiate': { templateId: 'guard', level: 1 },

  'adventurers_guild:guildmaster': {
    templateId: 'guard',
    level: 8,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'adventurers_guild:captain': {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'adventurers_guild:quartermaster': { templateId: 'commoner', level: 3 },
  'adventurers_guild:veteran': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'adventurers_guild:adventurer': {
    templateId: 'guard',
    level: 3,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'adventurers_guild:scout': { templateId: 'scout', level: 3 },
  'adventurers_guild:member': {
    templateId: 'guard',
    level: 2,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'adventurers_guild:recruit': { templateId: 'guard', level: 1 },

  'thieves_guild:guildmaster': { templateId: 'criminal', level: 9 },
  'thieves_guild:lieutenant': { templateId: 'criminal', level: 6 },
  'thieves_guild:cutpurse': { templateId: 'criminal', level: 2 },
  'thieves_guild:member': { templateId: 'criminal', level: 2 },
  'thieves_guild:apprentice': { templateId: 'criminal', level: 1 },

  'assassins_order:grandmaster': { templateId: 'criminal', level: 12 },
  'assassins_order:master_assassin': { templateId: 'criminal', level: 9 },
  'assassins_order:handler': { templateId: 'criminal', level: 6 },
  'assassins_order:assassin': { templateId: 'criminal', level: 5 },
  'assassins_order:operative': { templateId: 'criminal', level: 4 },
  'assassins_order:agent': { templateId: 'criminal', level: 3 },
  'assassins_order:initiate': { templateId: 'criminal', level: 1 },

  'spy_ring:spymaster': { templateId: 'criminal', level: 10 },
  'spy_ring:handler': { templateId: 'criminal', level: 6 },
  'spy_ring:case_officer': { templateId: 'criminal', level: 5 },
  'spy_ring:agent': { templateId: 'criminal', level: 4 },
  'spy_ring:operative': { templateId: 'criminal', level: 4 },
  'spy_ring:courier': { templateId: 'criminal', level: 2 },
  'spy_ring:informant': { templateId: 'commoner', level: 0 },

  'intelligence_bureau:director': { templateId: 'criminal', level: 10 },
  'intelligence_bureau:deputy_director': { templateId: 'commoner', level: 8 },
  'intelligence_bureau:spymaster': { templateId: 'criminal', level: 9 },
  'intelligence_bureau:handler': { templateId: 'criminal', level: 6 },
  'intelligence_bureau:analyst': { templateId: 'scholar', level: 3 },
  'intelligence_bureau:agent': { templateId: 'criminal', level: 4 },
  'intelligence_bureau:operative': { templateId: 'criminal', level: 4 },
  'intelligence_bureau:informant': { templateId: 'commoner', level: 0 },

  'mage_college:rector': {
    templateId: 'scholar',
    level: 10,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  'mage_college:master': {
    templateId: 'scholar',
    level: 9,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  'mage_college:professor': {
    templateId: 'scholar',
    level: 6,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  'mage_college:mage': {
    templateId: 'scholar',
    level: 4,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  'mage_college:researcher': { templateId: 'scholar', level: 3 },
  'mage_college:adept': {
    templateId: 'scholar',
    level: 2,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  'mage_college:apprentice': {
    templateId: 'scholar',
    level: 1,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },

  'druid_circle:archdruid': {
    templateId: 'scout',
    level: 14,
    classPreferenceOverrideSlugs: ['druid'],
  },
  'druid_circle:elder_druid': {
    templateId: 'scout',
    level: 10,
    classPreferenceOverrideSlugs: ['druid'],
  },
  'druid_circle:druid': { templateId: 'scout', level: 5, classPreferenceOverrideSlugs: ['druid'] },
  'druid_circle:warden': { templateId: 'scout', level: 4, classPreferenceOverrideSlugs: ['druid'] },
  'druid_circle:keeper': { templateId: 'scout', level: 3, classPreferenceOverrideSlugs: ['druid'] },
  'druid_circle:acolyte': {
    templateId: 'scout',
    level: 1,
    classPreferenceOverrideSlugs: ['druid'],
  },
  'druid_circle:initiate': {
    templateId: 'scout',
    level: 1,
    classPreferenceOverrideSlugs: ['druid'],
  },

  'church:high_priest': { templateId: 'priest', level: 10 },
  'church:priest': { templateId: 'priest', level: 5 },
  'church:elder': { templateId: 'priest', level: 6 },
  'church:minister': { templateId: 'priest', level: 4 },
  'church:deacon': { templateId: 'commoner', level: 2 },
  'church:cleric': { templateId: 'priest', level: 3 },
  'church:acolyte': { templateId: 'priest', level: 1 },
  'church:congregant': { templateId: 'commoner', level: 0 },

  'bank:treasurer': { templateId: 'commoner', level: 3 },
  'bank:proprietor': { templateId: 'commoner', level: 0 },
  'bank:banker': { templateId: 'merchant', level: 2 },
  'bank:manager': { templateId: 'commoner', level: 2 },
  'bank:cashier': { templateId: 'commoner', level: 0 },
  'bank:accountant': { templateId: 'commoner', level: 1 },
  'bank:clerk': { templateId: 'commoner', level: 0 },

  'shipping_company:proprietor': { templateId: 'commoner', level: 0 },
  'shipping_company:shipping_master': { templateId: 'commoner', level: 4 },
  'shipping_company:captain': { templateId: 'guard', level: 6 },
  'shipping_company:dispatcher': { templateId: 'commoner', level: 2 },
  'shipping_company:navigator': { templateId: 'scout', level: 4 },
  'shipping_company:courier': { templateId: 'commoner', level: 0 },
  'shipping_company:crew': { templateId: 'commoner', level: 2 },
  'shipping_company:clerk': { templateId: 'commoner', level: 0 },

  'pirate_crew:captain': { templateId: 'guard', level: 7 },
  'pirate_crew:quartermaster': { templateId: 'commoner', level: 4 },
  'pirate_crew:sailing_master': { templateId: 'scout', level: 5 },
  'pirate_crew:boatswain': { templateId: 'commoner', level: 3 },
  'pirate_crew:gunner': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'pirate_crew:pirate': {
    templateId: 'guard',
    level: 3,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'pirate_crew:sailor': { templateId: 'commoner', level: 2 },
  'pirate_crew:cabin_hand': { templateId: 'commoner', level: 1 },

  'private_security_company:director': { templateId: 'commoner', level: 8 },
  'private_security_company:security_chief': {
    templateId: 'guard',
    level: 8,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'private_security_company:captain': {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'private_security_company:supervisor': {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'private_security_company:bodyguard': {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  'private_security_company:guard': { templateId: 'guard', level: 3 },
  'private_security_company:investigator': { templateId: 'criminal', level: 4 },
  'private_security_company:recruit': { templateId: 'guard', level: 1 },
  'bounty_hunters:guildmaster': {
    templateId: 'guard',
    level: 8,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  'hospital_order:grand_master': { templateId: 'priest', level: 10 },
}

/** @type {Record<string, { templateId: string, level: number }>} */
const TITLE_DEFAULTS = {
  abbot: { templateId: 'priest', level: 8 },
  accountant: { templateId: 'commoner', level: 1 },
  acolyte: { templateId: 'priest', level: 1 },
  actor: { templateId: 'commoner', level: 2 },
  adept: { templateId: 'scholar', level: 2, classPreferenceOverrideSlugs: ['wizard', 'sorcerer'] },
  administrator: { templateId: 'commoner', level: 2 },
  admiral: { templateId: 'guard', level: 14, classPreferenceOverrideSlugs: ['fighter', 'paladin'] },
  adventurer: {
    templateId: 'guard',
    level: 3,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  agent: { templateId: 'criminal', level: 3 },
  analyst: { templateId: 'scholar', level: 3 },
  apprentice: { templateId: 'artisan', level: 1 },
  archdruid: { templateId: 'scout', level: 14, classPreferenceOverrideSlugs: ['druid'] },
  archivist: { templateId: 'scholar', level: 2 },
  archmage: {
    templateId: 'scholar',
    level: 14,
    classPreferenceOverrideSlugs: ['wizard', 'sorcerer'],
  },
  artisan: { templateId: 'artisan', level: 2 },
  assassin: { templateId: 'criminal', level: 5 },
  banker: { templateId: 'merchant', level: 2 },
  benefactor: { templateId: 'commoner', level: 0 },
  boatswain: { templateId: 'commoner', level: 3 },
  bodyguard: {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  boss: { templateId: 'commoner', level: 8 },
  bounty_hunter: {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  brewer: { templateId: 'artisan', level: 1 },
  brewmaster: { templateId: 'artisan', level: 3 },
  broker: { templateId: 'merchant', level: 2 },
  brother: { templateId: 'commoner', level: 0 },
  buyer: { templateId: 'merchant', level: 1 },
  cabin_hand: { templateId: 'commoner', level: 1 },
  captain: { templateId: 'guard', level: 6, classPreferenceOverrideSlugs: ['fighter', 'paladin'] },
  caravan_master: { templateId: 'commoner', level: 4 },
  carpenter: { templateId: 'artisan', level: 1 },
  cartographer: { templateId: 'scholar', level: 2 },
  case_officer: { templateId: 'criminal', level: 5 },
  cashier: { templateId: 'commoner', level: 0 },
  cellarer: { templateId: 'commoner', level: 0 },
  chair: { templateId: 'commoner', level: 0 },
  chancellor: { templateId: 'commoner', level: 0 },
  chief_cartographer: { templateId: 'scholar', level: 6 },
  chief_surveyor: { templateId: 'scout', level: 6 },
  cleric: { templateId: 'priest', level: 3 },
  clerk: { templateId: 'commoner', level: 0 },
  collector: {
    templateId: 'guard',
    level: 3,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  commander: {
    templateId: 'guard',
    level: 10,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  commissioner: { templateId: 'commoner', level: 6 },
  commodore: {
    templateId: 'guard',
    level: 11,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  company_manager: { templateId: 'commoner', level: 3 },
  congregant: { templateId: 'commoner', level: 0 },
  constable: { templateId: 'guard', level: 2 },
  cooper: { templateId: 'artisan', level: 1 },
  coordinator: { templateId: 'commoner', level: 1 },
  courier: { templateId: 'commoner', level: 0 },
  crew: { templateId: 'commoner', level: 2 },
  cutpurse: { templateId: 'criminal', level: 2 },
  dean: { templateId: 'commoner', level: 4 },
  delegate: { templateId: 'commoner', level: 1 },
  deputy_director: { templateId: 'commoner', level: 8 },
  detective: { templateId: 'criminal', level: 5 },
  devotee: { templateId: 'commoner', level: 0 },
  director: { templateId: 'commoner', level: 6 },
  dispatcher: { templateId: 'commoner', level: 2 },
  doctor: { templateId: 'priest', level: 5, classPreferenceOverrideSlugs: ['cleric'] },
  drover: { templateId: 'commoner', level: 0 },
  driver: { templateId: 'commoner', level: 0 },
  druid: { templateId: 'scout', level: 5, classPreferenceOverrideSlugs: ['druid'] },
  elder: { templateId: 'commoner', level: 5 },
  elder_druid: { templateId: 'scout', level: 10, classPreferenceOverrideSlugs: ['druid'] },
  engraver: { templateId: 'artisan', level: 2 },
  enforcer: {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  engineer: { templateId: 'scout', level: 4 },
  examiner: { templateId: 'criminal', level: 4 },
  explorer: { templateId: 'scout', level: 3 },
  factor: { templateId: 'merchant', level: 3 },
  farm_manager: { templateId: 'commoner', level: 2 },
  farmer: { templateId: 'commoner', level: 0 },
  fellow: { templateId: 'scholar', level: 2 },
  fence: { templateId: 'merchant', level: 3 },
  fixer: { templateId: 'criminal', level: 4 },
  foreman: { templateId: 'commoner', level: 3 },
  forger: { templateId: 'artisan', level: 3 },
  general: { templateId: 'guard', level: 14, classPreferenceOverrideSlugs: ['fighter', 'paladin'] },
  grand_inquisitor: { templateId: 'criminal', level: 12 },
  grand_master: { templateId: 'commoner', level: 10 },
  grandmaster: { templateId: 'commoner', level: 10 },
  grower: { templateId: 'commoner', level: 0 },
  guard: { templateId: 'guard', level: 3 },
  guide: { templateId: 'scout', level: 3 },
  guild_steward: { templateId: 'commoner', level: 3 },
  guildmaster: { templateId: 'commoner', level: 8 },
  gunner: { templateId: 'guard', level: 4, classPreferenceOverrideSlugs: ['fighter', 'barbarian'] },
  handler: { templateId: 'criminal', level: 5 },
  healer: { templateId: 'priest', level: 4, classPreferenceOverrideSlugs: ['cleric'] },
  hierophant: { templateId: 'priest', level: 8 },
  high_inquisitor: { templateId: 'criminal', level: 9 },
  high_priest: { templateId: 'priest', level: 10 },
  hospitaller: { templateId: 'priest', level: 3, classPreferenceOverrideSlugs: ['cleric'] },
  huntmaster: {
    templateId: 'guard',
    level: 7,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  informant: { templateId: 'commoner', level: 0 },
  initiate: { templateId: 'guard', level: 1 },
  inquisitor: { templateId: 'criminal', level: 6 },
  inspector: { templateId: 'criminal', level: 4 },
  instructor: { templateId: 'scholar', level: 2 },
  interrogator: { templateId: 'criminal', level: 4 },
  investigator: { templateId: 'criminal', level: 4 },
  journeyman: { templateId: 'artisan', level: 2 },
  keeper: { templateId: 'commoner', level: 2 },
  knight: { templateId: 'guard', level: 5, classPreferenceOverrideSlugs: ['fighter', 'barbarian'] },
  knight_captain: {
    templateId: 'guard',
    level: 7,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  knight_commander: {
    templateId: 'guard',
    level: 10,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  laborer: { templateId: 'commoner', level: 0 },
  lay_worker: { templateId: 'commoner', level: 0 },
  lead_actor: { templateId: 'commoner', level: 4 },
  lecturer: { templateId: 'scholar', level: 2 },
  lieutenant: {
    templateId: 'guard',
    level: 6,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  logger: { templateId: 'commoner', level: 1 },
  lookout: { templateId: 'scout', level: 2 },
  manager: { templateId: 'commoner', level: 2 },
  marine: { templateId: 'guard', level: 3 },
  marshal: { templateId: 'guard', level: 13, classPreferenceOverrideSlugs: ['fighter', 'paladin'] },
  master: { templateId: 'artisan', level: 4 },
  master_artisan: { templateId: 'artisan', level: 5 },
  master_assassin: { templateId: 'criminal', level: 9 },
  master_fence: { templateId: 'merchant', level: 5 },
  master_forger: { templateId: 'artisan', level: 6 },
  master_healer: { templateId: 'priest', level: 8, classPreferenceOverrideSlugs: ['cleric'] },
  master_thief: { templateId: 'criminal', level: 9 },
  mate: { templateId: 'commoner', level: 3 },
  matriarch: { templateId: 'commoner', level: 0 },
  member: { templateId: 'commoner', level: 0 },
  mercenary: {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  merchant: { templateId: 'merchant', level: 0 },
  militiaman: { templateId: 'guard', level: 2 },
  mine_captain: { templateId: 'commoner', level: 5 },
  miner: { templateId: 'commoner', level: 1 },
  minister: { templateId: 'commoner', level: 6 },
  missionary: { templateId: 'priest', level: 2 },
  mission_director: { templateId: 'commoner', level: 6 },
  musician: { templateId: 'commoner', level: 2 },
  navigator: { templateId: 'scout', level: 4 },
  novice: { templateId: 'priest', level: 1 },
  officer: { templateId: 'commoner', level: 2 },
  operative: { templateId: 'criminal', level: 4 },
  oracle: { templateId: 'priest', level: 6 },
  organizer: { templateId: 'commoner', level: 2 },
  party_leader: { templateId: 'commoner', level: 8 },
  passer: { templateId: 'criminal', level: 2 },
  patriarch: { templateId: 'commoner', level: 0 },
  physician: { templateId: 'priest', level: 5, classPreferenceOverrideSlugs: ['cleric'] },
  pirate: { templateId: 'guard', level: 3, classPreferenceOverrideSlugs: ['fighter', 'barbarian'] },
  playwright: { templateId: 'commoner', level: 3 },
  preacher: { templateId: 'priest', level: 2 },
  president: { templateId: 'commoner', level: 0 },
  priest: { templateId: 'priest', level: 5 },
  prior: { templateId: 'commoner', level: 6 },
  printer: { templateId: 'artisan', level: 2 },
  professor: { templateId: 'scholar', level: 4 },
  prospector: { templateId: 'commoner', level: 2 },
  proprietor: { templateId: 'commoner', level: 0 },
  quartermaster: { templateId: 'commoner', level: 3 },
  recruiter: { templateId: 'commoner', level: 2 },
  recruit: { templateId: 'guard', level: 1 },
  rector: { templateId: 'commoner', level: 0 },
  representative: { templateId: 'commoner', level: 1 },
  researcher: { templateId: 'scholar', level: 2 },
  rigger: { templateId: 'commoner', level: 1 },
  ringleader: { templateId: 'commoner', level: 8 },
  runner: { templateId: 'commoner', level: 0 },
  sailing_master: { templateId: 'scout', level: 5 },
  sailor: { templateId: 'commoner', level: 2 },
  sawyer: { templateId: 'artisan', level: 1 },
  scholar: { templateId: 'scholar', level: 2 },
  scout: { templateId: 'scout', level: 3 },
  secretary: { templateId: 'commoner', level: 3 },
  senator: { templateId: 'commoner', level: 4 },
  sergeant: {
    templateId: 'guard',
    level: 4,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  shipwright: { templateId: 'artisan', level: 3 },
  shipwright_master: { templateId: 'artisan', level: 6 },
  shipping_master: { templateId: 'commoner', level: 4 },
  shop_steward: { templateId: 'commoner', level: 2 },
  singer: { templateId: 'commoner', level: 2 },
  sister: { templateId: 'commoner', level: 0 },
  smuggler: { templateId: 'criminal', level: 4 },
  soldier: { templateId: 'guard', level: 2 },
  speaker: { templateId: 'commoner', level: 0 },
  spymaster: { templateId: 'criminal', level: 9 },
  squire: { templateId: 'guard', level: 2 },
  stagehand: { templateId: 'commoner', level: 0 },
  steward: { templateId: 'commoner', level: 2 },
  student: { templateId: 'scholar', level: 0 },
  supervisor: { templateId: 'commoner', level: 3 },
  surgeon: { templateId: 'priest', level: 6, classPreferenceOverrideSlugs: ['cleric'] },
  surveyor: { templateId: 'scout', level: 3 },
  teamster: { templateId: 'commoner', level: 1 },
  timber_master: { templateId: 'commoner', level: 4 },
  tracker: { templateId: 'scout', level: 4 },
  translator: { templateId: 'scholar', level: 2 },
  treasurer: { templateId: 'commoner', level: 3 },
  trustee: { templateId: 'commoner', level: 0 },
  veteran: {
    templateId: 'guard',
    level: 5,
    classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
  },
  volunteer: { templateId: 'commoner', level: 0 },
  warden: { templateId: 'commoner', level: 3 },
  watch_commander: {
    templateId: 'guard',
    level: 9,
    classPreferenceOverrideSlugs: ['fighter', 'paladin'],
  },
  yardmaster: { templateId: 'commoner', level: 4 },
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
    return { templateId: 'commoner', level: 0 }
  }

  /** @type {{ templateId: string, level: number }} */
  let rec = { ...base }

  // Kind-aware adjustments for ambiguous shared titles
  if (titleId === 'captain') {
    rec =
      kind === 'maritime'
        ? { templateId: 'guard', level: 6 }
        : kind === 'military' || kind === 'law' || kind === 'adventuring'
          ? { templateId: 'guard', level: 6, classPreferenceOverrideSlugs: ['fighter', 'paladin'] }
          : { templateId: 'commoner', level: 4 }
  } else if (titleId === 'director') {
    rec =
      kind === 'intelligence' || kind === 'law'
        ? { templateId: 'commoner', level: 8 }
        : kind === 'arts'
          ? { templateId: 'commoner', level: 5 }
          : { templateId: 'commoner', level: 6 }
  } else if (titleId === 'agent') {
    rec =
      kind === 'criminal' || kind === 'intelligence'
        ? { templateId: 'criminal', level: 4 }
        : kind === 'commercial'
          ? { templateId: 'merchant', level: 2 }
          : { templateId: 'commoner', level: 2 }
  } else if (titleId === 'member') {
    rec =
      kind === 'criminal'
        ? { templateId: 'criminal', level: 2 }
        : kind === 'adventuring'
          ? {
              templateId: 'guard',
              level: 2,
              classPreferenceOverrideSlugs: ['fighter', 'barbarian'],
            }
          : kind === 'military'
            ? { templateId: 'guard', level: 2 }
            : { templateId: 'commoner', level: 0 }
  } else if (titleId === 'lieutenant') {
    rec =
      kind === 'maritime'
        ? { templateId: 'guard', level: 5 }
        : kind === 'criminal'
          ? { templateId: 'criminal', level: 6 }
          : { templateId: 'guard', level: 6, classPreferenceOverrideSlugs: ['fighter', 'paladin'] }
  } else if (titleId === 'master' && kind === 'arcane') {
    rec = { templateId: 'scholar', level: 9, classPreferenceOverrideSlugs: ['wizard', 'sorcerer'] }
  } else if (titleId === 'mage') {
    rec = { templateId: 'scholar', level: 4, classPreferenceOverrideSlugs: ['wizard', 'sorcerer'] }
  } else if (titleId === 'initiate') {
    rec =
      kind === 'religious'
        ? { templateId: 'priest', level: 1 }
        : kind === 'nature'
          ? { templateId: 'scout', level: 1, classPreferenceOverrideSlugs: ['druid'] }
          : kind === 'criminal'
            ? { templateId: 'criminal', level: 1 }
            : { templateId: 'guard', level: 1 }
  } else if (titleId === 'apprentice') {
    rec =
      kind === 'arcane'
        ? { templateId: 'scholar', level: 1, classPreferenceOverrideSlugs: ['wizard', 'sorcerer'] }
        : kind === 'occupational' || kind === 'commercial'
          ? { templateId: 'artisan', level: 1 }
          : kind === 'criminal'
            ? { templateId: 'criminal', level: 1 }
            : { templateId: 'artisan', level: 1 }
  } else if (titleId === 'grand_master' && kind === 'religious') {
    rec = { templateId: 'priest', level: 12 }
  } else if (titleId === 'grand_master' && kind === 'medical') {
    rec = { templateId: 'priest', level: 10 }
  } else if (titleId === 'grand_master' && kind === 'military') {
    rec = { templateId: 'guard', level: 12, classPreferenceOverrideSlugs: ['fighter', 'paladin'] }
  } else if (titleId === 'guildmaster') {
    rec =
      kind === 'criminal'
        ? { templateId: 'criminal', level: 9 }
        : kind === 'adventuring'
          ? { templateId: 'guard', level: 8, classPreferenceOverrideSlugs: ['fighter', 'paladin'] }
          : kind === 'law'
            ? {
                templateId: 'guard',
                level: 8,
                classPreferenceOverrideSlugs: ['fighter', 'paladin'],
              }
            : rec
  } else if (titleId === 'boss' && kind === 'criminal') {
    rec = { templateId: 'criminal', level: 8 }
  } else if (titleId === 'ringleader' && kind === 'criminal') {
    rec = { templateId: 'criminal', level: 8 }
  } else if (titleId === 'elder' && kind === 'religious') {
    rec = { templateId: 'priest', level: 5 }
  } else if (titleId === 'rector' && kind === 'arcane') {
    rec = { templateId: 'scholar', level: 10, classPreferenceOverrideSlugs: ['wizard', 'sorcerer'] }
  } else if (titleId === 'director' && kind === 'intelligence') {
    rec = { templateId: 'criminal', level: 10 }
  }

  if (rec.templateId === 'artisan' && !rec.toolPreferenceSlugs) {
    const toolPreferenceSlugs = ARTISAN_TITLE_TOOL_PREFERENCES[titleId]
    if (toolPreferenceSlugs) rec.toolPreferenceSlugs = toolPreferenceSlugs
  }

  if (!NPC_TEMPLATE_IDS.includes(rec.templateId)) {
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

function formatSlugList(slugs) {
  return `[${slugs.map((slug) => `'${slug}'`).join(', ')}]`
}

function formatRecommendation(rec) {
  const parts = [`templateId: '${rec.templateId}'`, `level: ${rec.level}`]
  if (rec.classPreferenceOverrideSlugs?.length) {
    parts.push(`classPreferenceOverrideSlugs: ${formatSlugList(rec.classPreferenceOverrideSlugs)}`)
  }
  if (rec.skillPreferenceSlugs?.length) {
    parts.push(`skillPreferenceSlugs: ${formatSlugList(rec.skillPreferenceSlugs)}`)
  }
  if (rec.toolPreferenceSlugs?.length) {
    parts.push(`toolPreferenceSlugs: ${formatSlugList(rec.toolPreferenceSlugs)}`)
  }
  return `{ ${parts.join(', ')} }`
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
    .map(([key, rec]) => `  '${key}': ${formatRecommendation(rec)},`)

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
