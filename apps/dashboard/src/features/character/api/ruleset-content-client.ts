import type {
  CharacterBuildLanguageOption,
  CharacterClass,
  Equipment,
  RulesetPatchRead,
  SkillProficiency,
  Species,
  Spell,
  SystemRulesetId,
} from '@rpg/contracts'

import { request } from '@/lib/api-client'

const RULESET_CONTENT_ERROR = 'Could not load ruleset content.'
const RULESET_RULES_ERROR = 'Could not load character creation rules.'

type RulesetContentConfig = {
  routeKey: string
  responseKey: string
}

const BUILDER_CATALOG_CONTENT = [
  { routeKey: 'species', responseKey: 'species' },
  { routeKey: 'classes', responseKey: 'classes' },
  { routeKey: 'spells', responseKey: 'spells' },
  { routeKey: 'equipment', responseKey: 'equipment' },
  { routeKey: 'skill-proficiencies', responseKey: 'skillProficiencies' },
] as const satisfies readonly RulesetContentConfig[]

export type BuilderCatalogContentKey = (typeof BUILDER_CATALOG_CONTENT)[number]['routeKey']

export type BuilderCatalogLists = {
  species: Species[]
  classes: CharacterClass[]
  spells: Spell[]
  equipment: Equipment[]
  skillProficiencies: SkillProficiency[]
  languages: CharacterBuildLanguageOption[]
}

async function listRulesetContent<T>(
  rulesetId: SystemRulesetId,
  config: RulesetContentConfig,
): Promise<T[]> {
  const body = await request<Record<string, T[]>>(
    `/api/rulesets/${rulesetId}/content/${config.routeKey}`,
    undefined,
    RULESET_CONTENT_ERROR,
  )
  return body[config.responseKey] as T[]
}

export async function listRulesetSpecies(rulesetId: SystemRulesetId): Promise<Species[]> {
  return listRulesetContent(rulesetId, BUILDER_CATALOG_CONTENT[0])
}

export async function listRulesetClasses(rulesetId: SystemRulesetId): Promise<CharacterClass[]> {
  return listRulesetContent(rulesetId, BUILDER_CATALOG_CONTENT[1])
}

export async function listRulesetSpells(rulesetId: SystemRulesetId): Promise<Spell[]> {
  return listRulesetContent(rulesetId, BUILDER_CATALOG_CONTENT[2])
}

export async function listRulesetEquipment(rulesetId: SystemRulesetId): Promise<Equipment[]> {
  return listRulesetContent(rulesetId, BUILDER_CATALOG_CONTENT[3])
}

export async function listRulesetSkillProficiencies(
  rulesetId: SystemRulesetId,
): Promise<SkillProficiency[]> {
  return listRulesetContent(rulesetId, BUILDER_CATALOG_CONTENT[4])
}

export async function listRulesetLanguages(
  rulesetId: SystemRulesetId,
): Promise<CharacterBuildLanguageOption[]> {
  const body = await request<Record<string, CharacterBuildLanguageOption[]>>(
    `/api/rulesets/${rulesetId}/languages`,
    undefined,
    RULESET_CONTENT_ERROR,
  )
  return body.languages as CharacterBuildLanguageOption[]
}

export async function fetchBuilderCatalog(
  rulesetId: SystemRulesetId,
): Promise<BuilderCatalogLists> {
  const [species, classes, spells, equipment, skillProficiencies, languages] = await Promise.all([
    listRulesetSpecies(rulesetId),
    listRulesetClasses(rulesetId),
    listRulesetSpells(rulesetId),
    listRulesetEquipment(rulesetId),
    listRulesetSkillProficiencies(rulesetId),
    listRulesetLanguages(rulesetId),
  ])

  return { species, classes, spells, equipment, skillProficiencies, languages }
}

export async function fetchCharacterCreationRules(
  rulesetId: SystemRulesetId,
): Promise<RulesetPatchRead> {
  const { patch } = await request<{ patch: RulesetPatchRead }>(
    `/api/rulesets/${rulesetId}/character-creation-rules`,
    undefined,
    RULESET_RULES_ERROR,
  )
  return patch
}

export function buildContextQueryKey(rulesetId: SystemRulesetId) {
  return ['rulesets', rulesetId, 'character-builder-context'] as const
}
