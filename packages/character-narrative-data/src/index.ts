import type { NarrativeCollection } from '@rpg/contracts/character-narrative'

/** Trusted manifest entry: authored prose stays outside the initial dashboard bundle. */
export async function loadNarrativeCollection(): Promise<NarrativeCollection> {
  const { foundationCollection } = await import('./collections/foundation')
  return foundationCollection
}
