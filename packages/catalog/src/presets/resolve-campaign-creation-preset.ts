import type {
  CampaignTemplate,
  CreateCampaignInput,
  UpdateCampaignCharacterCreationInput,
  WorldSeedPack,
} from '@rpg/contracts'

import { loadCampaignPresetCatalog } from './preset-catalog'

export type MaterializedCreateCampaignInput = Omit<CreateCampaignInput, 'campaignTemplateId'>

export type CampaignCreationPresetResolution =
  | {
      ok: true
      input: MaterializedCreateCampaignInput
      template?: CampaignTemplate
      worldSeedPacks: WorldSeedPack[]
    }
  | {
      ok: false
      reason: 'template_not_found' | 'ruleset_mismatch'
      campaignTemplateId: string
    }

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Merge sparse nested defaults; explicit arrays and scalar values replace defaults. */
function mergeDefined<T extends object>(defaults: T, explicit: Partial<T>): T {
  const merged: PlainObject = { ...(defaults as PlainObject) }

  for (const [key, explicitValue] of Object.entries(explicit)) {
    if (explicitValue === undefined) continue
    const defaultValue = merged[key]
    merged[key] =
      isPlainObject(defaultValue) && isPlainObject(explicitValue)
        ? mergeDefined(defaultValue, explicitValue)
        : explicitValue
  }

  return merged as T
}

function omitCampaignTemplateId(input: CreateCampaignInput): MaterializedCreateCampaignInput {
  const materialized = { ...input }
  delete materialized.campaignTemplateId
  return materialized
}

function materializeFlavor(
  template: CampaignTemplate,
  explicit: MaterializedCreateCampaignInput,
): MaterializedCreateCampaignInput['flavor'] {
  const templateFlavor = template.defaults.configuration?.flavor
  if (!templateFlavor && !explicit.flavor) return undefined
  return { ...templateFlavor, ...explicit.flavor }
}

function materializeCharacterCreation(
  template: CampaignTemplate,
  explicit: MaterializedCreateCampaignInput,
): UpdateCampaignCharacterCreationInput | undefined {
  const templateDefaults = template.defaults.characterCreation
  if (!templateDefaults && !explicit.characterCreation) return undefined
  return mergeDefined<UpdateCampaignCharacterCreationInput>(
    templateDefaults ?? {},
    explicit.characterCreation ?? {},
  )
}

function materializeInput(
  input: CreateCampaignInput,
  template: CampaignTemplate,
): MaterializedCreateCampaignInput {
  const explicit = omitCampaignTemplateId(input)
  const templateIdentity = template.defaults.identity

  return {
    ...explicit,
    description: explicit.description ?? templateIdentity?.description,
    imageKey: explicit.imageKey ?? templateIdentity?.imageKey,
    rulesetId: explicit.rulesetId ?? template.rulesetId,
    flavor: materializeFlavor(template, explicit),
    characterCreation: materializeCharacterCreation(template, explicit),
  }
}

/**
 * Resolve a create request against the shipped preset catalog without writes.
 * The returned seed packs are planning inputs only while WorldSeedPack is a stub.
 */
export function resolveCampaignCreationPreset(
  input: CreateCampaignInput,
): CampaignCreationPresetResolution {
  const { campaignTemplateId } = input
  if (!campaignTemplateId) {
    return { ok: true, input: omitCampaignTemplateId(input), worldSeedPacks: [] }
  }

  const catalog = loadCampaignPresetCatalog()
  const template = catalog.campaignTemplates.find(
    (entry) => entry.metadata.id === campaignTemplateId,
  )
  if (!template) {
    return { ok: false, reason: 'template_not_found', campaignTemplateId }
  }

  if (input.rulesetId !== undefined && input.rulesetId !== template.rulesetId) {
    return { ok: false, reason: 'ruleset_mismatch', campaignTemplateId }
  }

  const packIds = new Set(template.worldSeedPackIds)
  const worldSeedPacks = catalog.worldSeedPacks.filter((pack) => packIds.has(pack.metadata.id))

  return {
    ok: true,
    input: materializeInput(input, template),
    template,
    worldSeedPacks,
  }
}
