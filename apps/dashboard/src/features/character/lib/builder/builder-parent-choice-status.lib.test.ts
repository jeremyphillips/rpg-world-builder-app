import { describe, expect, it } from 'vitest'

import {
  characterBuilderDependentChoiceMessages,
  DEPENDENT_CHOICE_KINDS,
  formatFieldMessage,
} from '@rpg/contracts'

import {
  CHANGE_HERITAGE_LABEL,
  DEPENDENT_KIND_HERITAGE,
  formatParentChoiceTitleMeta,
} from './builder-parent-choice-status.lib'

describe('builder-parent-choice-status.lib', () => {
  it('formats unresolved parent title meta', () => {
    expect(
      formatParentChoiceTitleMeta({
        dependentKindLabel: DEPENDENT_KIND_HERITAGE,
        required: true,
      }),
    ).toBe(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceRequired({
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    )
  })

  it('formats resolved parent title meta', () => {
    expect(
      formatParentChoiceTitleMeta({
        dependentKindLabel: DEPENDENT_KIND_HERITAGE,
        required: false,
        selectedOptionLabel: 'Drow',
      }),
    ).toBe(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceSelected({
          selectedOptionLabel: 'Drow',
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    )
  })

  it('exports explicit change label from contracts messages', () => {
    expect(CHANGE_HERITAGE_LABEL).toBe(
      formatFieldMessage(characterBuilderDependentChoiceMessages.changeHeritage()),
    )
  })
})
