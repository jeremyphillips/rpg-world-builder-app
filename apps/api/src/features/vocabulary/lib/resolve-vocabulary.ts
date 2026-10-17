import type {
  VocabularyOption,
  VocabularyOptionSet,
  VocabularyOptionSetPatch,
  VocabularySystemEntryPatchEntry,
} from '@rpg/contracts'

function resolveLanguageAffinities(
  seedAffinities: string[] | undefined,
  patch: Pick<VocabularySystemEntryPatchEntry, 'languageAffinities'> | undefined,
  campaignAffinities: string[] | undefined,
): string[] | undefined {
  if (campaignAffinities !== undefined) {
    return campaignAffinities
  }

  if (patch?.languageAffinities !== undefined) {
    return patch.languageAffinities
  }

  return seedAffinities
}

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
    const languageAffinities = resolveLanguageAffinities(
      seedOption.languageAffinities,
      patch,
      undefined,
    )

    return {
      id: seedOption.id,
      label: patch?.label ?? seedOption.label,
      description: patch?.description ?? seedOption.description,
      source: 'system' as const,
      status: patch?.status ?? seedOption.status,
      ...(patch?.media !== undefined ? { media: patch.media } : {}),
      ...(languageAffinities !== undefined ? { languageAffinities } : {}),
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
      media: entry.media,
      ...(entry.languageAffinities !== undefined
        ? { languageAffinities: entry.languageAffinities }
        : {}),
    })
  }

  return [...resolvedSystem, ...campaignOptions]
}
