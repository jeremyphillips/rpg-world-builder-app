import type { CreateCharacterInput } from '@rpg/contracts'

import { minimalStandalonePcInput } from './characters'

/**
 * Builder-finalized invite completion payload with a class skill selection.
 * Skill proficiencies are stored by slug (`athletics`), not content id.
 */
export const inviteCompletionBuilderPcInput: CreateCharacterInput = {
  ...minimalStandalonePcInput,
  proficiencies: {
    ...minimalStandalonePcInput.proficiencies,
    skills: [
      {
        skill: 'athletics',
        rank: 'proficient',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'class:srd-cc-5.2.1:fighter:class-skills',
          },
        ],
      },
    ],
  },
}

/**
 * Invite completion payload referencing a subclass absent from campaign catalogs.
 * Eligibility should surface `content_missing` instead of silently skipping.
 */
export const inviteCompletionMissingSubclassPcInput: CreateCharacterInput = {
  ...minimalStandalonePcInput,
  classes: [
    {
      classId: 'srd-cc-5.2.1:fighter',
      subclassId: 'srd-cc-5.2.1:missing-subclass',
      level: 1,
    },
  ],
}
