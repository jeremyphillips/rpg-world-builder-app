import { LAIR_TERM } from '@rpg/contracts'
import type { DisplayConfig, FormItem } from '@rpg/ui/form'

import {
  MONSTER_ADD_IN_LAIR_XP_LABEL,
  MONSTER_HAS_LAIR_ENHANCEMENTS_HINT,
  MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL,
  MONSTER_LAIR_EXPERIENCE_ADD_HINT,
  MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
  MONSTER_LAIR_EXPERIENCE_MODE_LABEL,
  MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL,
  MONSTER_LAIR_SECTION_HINT,
  MONSTER_LAIR_XP_GROUP_HEADING,
} from '../monster-form-labels'
import {
  lairExperienceModeVisibility,
  monsterLairEnabledVisibility,
  resolveMonsterLairCustomXpHint,
  resolveMonsterLairExperienceModeOptions,
  resolveMonsterLairSuggestedXpCaptionDisplayContent,
  resolveMonsterLairSuggestedXpDisplayContent,
  seedMonsterLairExperience,
} from './monster-lair-form-fields.lib'

function monsterLairSuggestedXpDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'lair-suggested-xp',
    visibility: lairExperienceModeVisibility('suggested'),
    resolve: {
      dependsOn: ['../../challengeRating', 'mode'],
      contentWhen: resolveMonsterLairSuggestedXpDisplayContent,
    },
  }
}

function monsterLairSuggestedXpCaptionDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'lair-suggested-xp-caption',
    visibility: lairExperienceModeVisibility('suggested'),
    resolve: {
      dependsOn: ['../../challengeRating', 'mode'],
      contentWhen: resolveMonsterLairSuggestedXpCaptionDisplayContent,
    },
  }
}

function monsterLairExperienceGroup(): FormItem {
  return {
    kind: 'group',
    name: 'lair.experience',
    heading: { label: MONSTER_LAIR_XP_GROUP_HEADING, hint: MONSTER_LAIR_EXPERIENCE_ADD_HINT },
    headingScale: 'field',
    visibility: monsterLairEnabledVisibility,
    optionalDisclosure: {
      intent: 'add',
      addLabel: MONSTER_ADD_IN_LAIR_XP_LABEL,
      removeLabel: MONSTER_LAIR_EXPERIENCE_REMOVE_LABEL,
      expandWhenPopulated: true,
      watchPaths: ['lair.experience'],
      clearPaths: ['lair.experience'],
      seedWhen: seedMonsterLairExperience,
    },
    fields: [
      {
        type: 'select',
        name: 'mode',
        label: MONSTER_LAIR_EXPERIENCE_MODE_LABEL,
        placeholder: 'Choose',
        optionsResolve: {
          dependsOn: ['../../challengeRating'],
          optionsWhen: resolveMonsterLairExperienceModeOptions,
        },
      },
      monsterLairSuggestedXpDisplay(),
      monsterLairSuggestedXpCaptionDisplay(),
      {
        type: 'number',
        name: 'value',
        label: MONSTER_LAIR_EXPERIENCE_CUSTOM_LABEL,
        min: 0,
        digits: 5,
        visibility: lairExperienceModeVisibility('custom'),
        hint: {
          resolve: {
            dependsOn: ['../../challengeRating', 'mode'],
            hintWhen: resolveMonsterLairCustomXpHint,
          },
        },
      },
    ],
  }
}

export function monsterLairFormFields(): FormItem[] {
  return [
    {
      kind: 'group',
      heading: { label: LAIR_TERM.label, hint: MONSTER_LAIR_SECTION_HINT },
      fields: [
        {
          type: 'switch',
          name: 'lair.enabled',
          label: MONSTER_HAS_LAIR_ENHANCEMENTS_LABEL,
          hint: MONSTER_HAS_LAIR_ENHANCEMENTS_HINT,
          labelPosition: 'inline',
        },
        monsterLairExperienceGroup(),
      ],
    },
  ]
}

export { monsterLairEnabledVisibility } from './monster-lair-form-fields.lib'
