import type {
  VocabularyOption,
  VocabularyOptionSet,
  VocabularyOptionSetPatch,
} from '@rpg/contracts'

/** Merge catalog seed with a campaign vocabulary patch into one resolved set. */
export function resolveVocabularySet(
  seed: VocabularyOptionSet,
  setPatch: VocabularyOptionSetPatch | undefined,
): VocabularyOption[] {
  const systemPatches = new Map(
    (setPatch?.systemEntryPatches ?? []).map((patch) => [patch.id, patch]),
  )
  const removedCampaignIds = new Set(setPatch?.removedCampaignEntryIds ?? [])
  const campaignEntries = (setPatch?.campaignEntries ?? []).filter(
    (entry) => !removedCampaignIds.has(entry.id),
  )
  const campaignById = new Map(campaignEntries.map((entry) => [entry.id, entry]))

  const resolvedSystem = seed.options.map((seedOption) => {
    const patch = systemPatches.get(seedOption.id)
    return {
      id: seedOption.id,
      label: patch?.label ?? seedOption.label,
      description: patch?.description ?? seedOption.description,
      source: 'system' as const,
      status: patch?.status ?? seedOption.status,
    }
  })

  const campaignOptions: VocabularyOption[] = []
  for (const entry of campaignById.values()) {
    if (resolvedSystem.some((option) => option.id === entry.id)) {
      continue
    }
    campaignOptions.push({
      id: entry.id,
      label: entry.label,
      description: entry.description,
      source: 'campaign',
      status: entry.status ?? 'active',
    })
  }

  return [...resolvedSystem, ...campaignOptions]
}
