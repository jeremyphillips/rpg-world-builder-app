import type { NarrativeCollection } from '@rpg/contracts/character-narrative'

export { foundationCollection } from './collections/foundation'

/** Trusted manifest entry: authored prose stays outside the initial dashboard bundle. */
export async function loadNarrativeCollection(): Promise<NarrativeCollection> {
  const { foundationCollection } = await import('./collections/foundation')
  return foundationCollection
}
