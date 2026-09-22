import type {
  NarrativeGenerationContext,
  NarrativeGenerationResult,
} from '@rpg/contracts/character-narrative'
import { generateNarrative } from '@rpg/character-narrative-core'
import { loadNarrativeCollection } from '@rpg/character-narrative-data'

export { buildNarrativeContext } from './build-narrative-context'

export async function generateCharacterNarrative(
  context: NarrativeGenerationContext,
  seed: number,
): Promise<NarrativeGenerationResult> {
  try {
    const collection = await loadNarrativeCollection()
    return generateNarrative({ context, collection, seed })
  } catch {
    return {
      ok: false,
      reason: 'Narrative generation could not load its collection. Please try again.',
    }
  }
}
