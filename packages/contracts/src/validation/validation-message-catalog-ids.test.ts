import { describe, expect, it } from 'vitest'

import { authValidationMessages } from '../shared/auth-messages'
import { campaignPatchValidationMessages } from '../rpg/campaign/patches/campaign-patch-messages'
import { campaignInviteUnavailableMessages } from '../rpg/campaign/invite/unavailable-messages'
import { spellcastingProgressionValidationMessages } from '../rpg/campaign/rules/spellcasting-progression/messages'
import { progressionCurveValidationMessages } from '../rpg/campaign/rules/spellcasting-progression/progression-curve'
import { xpThresholdsValidationMessages } from '../rpg/campaign/rules/xp-progression'
import { classValidationMessages } from '../rpg/content/classes/class-messages'
import { classFeatureTableValidationMessages } from '../rpg/content/classes/class-feature-table-messages'
import { classCapacityProgressionValidationMessages } from '../rpg/content/classes/spellcasting/class-capacity-progression'
import { spellcastingValidationMessages } from '../rpg/content/classes/spellcasting/spellcasting-validation'
import { equipmentVariantValidationMessages } from '../rpg/content/equipment/equipment-variant-messages'
import { featValidationMessages } from '../rpg/content/feat-messages'
import { abilityScoreRequirementMessages } from '../rpg/content/lib/ability-score-requirements'
import { grantValidationMessages } from '../rpg/content/lib/grants/grant-messages'
import { spellResolutionValidationMessages } from '../rpg/content/lib/resolution/validation-messages'
import { resolutionTargetRequirementValidationMessages } from '../rpg/content/lib/resolution/target-requirements'
import { monsterActionOccurrenceMessages } from '../rpg/content/monster/action/monster-action-occurrence-messages'
import { multiattackValidationMessages } from '../rpg/content/monster/action/multiattack-validation-messages'
import { speciesCharacterCreationValidationMessages } from '../rpg/content/species-character-creation-messages'
import { generalTableValidationMessages } from '../rpg/content/tables/general-table-messages'
import { progressionTableValidationMessages } from '../rpg/content/tables/progression-table-messages'
import { creatureTelepathyMessages } from '../rpg/content/creature/communication-messages'
import { spellResolutionProgressionValidationMessages } from '../rpg/content/spell/resolution/progression/validation-messages'
import { contentMediaValidationMessages } from '../rpg/primitives/media/content-media-validation-messages'
import { levelValidationMessages } from '../rpg/primitives/level/level-messages'
import { rollValidationMessages } from '../rpg/primitives/mechanics/roll-messages'
import { standardArrayValidationMessages } from '../rpg/primitives/standard-array-messages'
import { xpProgressionValidationMessages } from '../rpg/primitives/xp-progression-messages'
import { characterValidationMessages } from '../rpg/runtime/character/character-messages'
import { characterBuilderAbilityRecommendationMessages } from '../rpg/runtime/character-builder/ability/ability-score-recommendation-messages'
import { characterBuilderAdvisoryMessages } from '../rpg/runtime/character-builder/messages/character-builder-advisory-messages'
import {
  characterBuilderValidationMessages,
  characterBuilderProficiencyChoiceEmptyMessages,
  characterBuilderSpellChoiceEmptyMessages,
  characterBuilderStepReadinessMessages,
} from '../rpg/runtime/character-builder/messages/character-builder-messages'
import { characterBuilderDependentChoiceMessages } from '../rpg/runtime/character-builder/messages/character-builder-dependent-choice-messages'
import { characterBuilderLevelMessages } from '../rpg/runtime/character-builder/messages/character-builder-level-messages'
import { characterBuilderPreviewMessages } from '../rpg/runtime/character-builder/messages/character-builder-preview-messages'
import { characterBuilderStepSelectionMessages } from '../rpg/runtime/character-builder/messages/character-builder-step-selection-messages'
import { abilityValidationMessages } from '../rpg/vocab/ability-messages'
import { spellValidationMessages } from '../rpg/vocab/spell/spell-messages'
import { vocabularyValidationMessages } from '../rpg/vocab/vocabulary-messages'
import { fieldValidationMessages } from './messages'

const TIERED_MESSAGE_CATALOGS = {
  fieldValidationMessages,
  levelValidationMessages,
  standardArrayValidationMessages,
  xpProgressionValidationMessages,
  xpThresholdsValidationMessages,
  progressionCurveValidationMessages,
  spellcastingProgressionValidationMessages,
  contentMediaValidationMessages,
  rollValidationMessages,
  abilityValidationMessages,
  vocabularyValidationMessages,
  authValidationMessages,
  campaignPatchValidationMessages,
  campaignInviteUnavailableMessages,
  classValidationMessages,
  classFeatureTableValidationMessages,
  classCapacityProgressionValidationMessages,
  spellcastingValidationMessages,
  featValidationMessages,
  equipmentVariantValidationMessages,
  grantValidationMessages,
  spellResolutionValidationMessages,
  resolutionTargetRequirementValidationMessages,
  spellResolutionProgressionValidationMessages,
  speciesCharacterCreationValidationMessages,
  generalTableValidationMessages,
  progressionTableValidationMessages,
  creatureTelepathyMessages,
  monsterActionOccurrenceMessages,
  multiattackValidationMessages,
  abilityScoreRequirementMessages,
  characterValidationMessages,
  characterBuilderValidationMessages,
  characterBuilderAdvisoryMessages,
  characterBuilderStepReadinessMessages,
  characterBuilderProficiencyChoiceEmptyMessages,
  characterBuilderSpellChoiceEmptyMessages,
  characterBuilderDependentChoiceMessages,
  characterBuilderLevelMessages,
  characterBuilderPreviewMessages,
  characterBuilderStepSelectionMessages,
  characterBuilderAbilityRecommendationMessages,
  spellValidationMessages,
}

function idsFromCatalog(catalog: Record<string, { readonly id: string }>): string[] {
  return Object.values(catalog).map((entry) => entry.id)
}

describe('validation message catalog ids', () => {
  it.each(Object.entries(TIERED_MESSAGE_CATALOGS))(
    '%s keeps defineMessage ids unique within the catalog',
    (_catalogName, catalog) => {
      const ids = idsFromCatalog(catalog)
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) {
        expect(id).toMatch(/^validation\.[a-zA-Z0-9_.-]+$/)
      }
    },
  )

  it('documents known cross-catalog id reuse (migrate in backlog — do not add new collisions)', () => {
    const byId = new Map<string, string[]>()
    for (const [catalogName, catalog] of Object.entries(TIERED_MESSAGE_CATALOGS)) {
      for (const id of idsFromCatalog(catalog)) {
        const owners = byId.get(id) ?? []
        owners.push(catalogName)
        byId.set(id, owners)
      }
    }
    const collisions = [...byId.entries()]
      .filter(([, owners]) => owners.length > 1)
      .sort(([a], [b]) => a.localeCompare(b))
    expect(collisions).toEqual([
      [
        'validation.xpProgression.increasingXp',
        ['xpProgressionValidationMessages', 'xpThresholdsValidationMessages'],
      ],
      [
        'validation.xpProgression.levelOneZeroXp',
        ['xpProgressionValidationMessages', 'xpThresholdsValidationMessages'],
      ],
    ])
  })
})
