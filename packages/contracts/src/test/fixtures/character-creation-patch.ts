import {
  DEFAULT_IMPORTED_CHARACTERS_POLICY,
  DEFAULT_STARTING_LEVEL,
  type CampaignCharacterCreationPatch,
} from '../../rpg/campaign/patches/campaign-character-creation-patch'
import { MAX_CHARACTER_LEVEL } from '../../rpg/primitives/level'

/** Sparse character-creation patch with campaign defaults only. */
export const baseCharacterCreationPatch = {
  startingLevel: DEFAULT_STARTING_LEVEL,
  importedCharacters: { policy: DEFAULT_IMPORTED_CHARACTERS_POLICY },
} satisfies CampaignCharacterCreationPatch

/** Progression patch enabling extended levels at `maxLevel`. */
export function extendedProgressionAt(
  maxLevel: number,
  tierName = 'Epic Destiny',
): Pick<CampaignCharacterCreationPatch, 'progression'> {
  return {
    progression: {
      maxCharacterLevel: MAX_CHARACTER_LEVEL,
      extendedProgression: { tierName, maxLevel },
    },
  }
}
