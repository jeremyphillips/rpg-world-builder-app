import type { QueryClient } from '@tanstack/react-query'

import {
  buildNarrativeContext,
  generateCharacterNarrative,
} from '@rpg/character-narrative-integrations'
import type { CharacterBuildContext, CreateNpcRequestInput } from '@rpg/contracts'
import type { Location } from '@rpg/contracts/rpg/content'

import {
  fetchNarrativeGenerationCampaignContext,
  formatNarrativeGenerationCampaignContextFailure,
} from '../../../lib/narrative/narrative-generation-campaign-context.lib'
import { generatedNarrativeToCharacterNarrative } from '../../../lib/narrative/generated-narrative-to-character-narrative.lib'
import type { QuickNpcPreparedCreate } from './quick-npc-create'

export class QuickNpcNarrativeGenerationFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuickNpcNarrativeGenerationFailedError'
  }
}

export function isQuickNpcNarrativeGenerationFailedError(
  error: unknown,
): error is QuickNpcNarrativeGenerationFailedError {
  return error instanceof QuickNpcNarrativeGenerationFailedError
}

export async function mergeQuickNpcGeneratedNarrativeOntoInput(args: {
  prepared: QuickNpcPreparedCreate
  buildContext: CharacterBuildContext
  locations: readonly Location[]
  characters: readonly { id: string; name: string }[]
}): Promise<CreateNpcRequestInput> {
  const generationContext = buildNarrativeContext({
    draft: args.prepared.draft,
    context: args.buildContext,
    locations: args.locations,
    characters: args.characters,
  })
  const result = await generateCharacterNarrative(
    generationContext,
    Math.floor(Math.random() * 2 ** 31),
  )
  if (!result.ok) {
    throw new QuickNpcNarrativeGenerationFailedError(result.reason)
  }

  return {
    ...args.prepared.input,
    narrative: generatedNarrativeToCharacterNarrative(result.narrative),
  }
}

/** Applies optional narrative generation to an already-prepared create. */
export async function resolveQuickNpcAuthoringCreateInput(args: {
  prepared: QuickNpcPreparedCreate
  buildContext: CharacterBuildContext
  campaignId: string
  queryClient: QueryClient
  generateNarrativeOnCreate: boolean
  skipNarrativeGeneration: boolean
}): Promise<CreateNpcRequestInput> {
  const { prepared } = args
  if (!args.generateNarrativeOnCreate || args.skipNarrativeGeneration) {
    return prepared.input
  }

  const campaignContext = await fetchNarrativeGenerationCampaignContext(
    args.queryClient,
    args.campaignId,
  )
  if (!campaignContext.ok) {
    throw new QuickNpcNarrativeGenerationFailedError(
      formatNarrativeGenerationCampaignContextFailure(
        campaignContext.reason,
        campaignContext.error,
      ),
    )
  }

  return mergeQuickNpcGeneratedNarrativeOntoInput({
    prepared,
    buildContext: args.buildContext,
    locations: campaignContext.locations,
    characters: campaignContext.characters,
  })
}
