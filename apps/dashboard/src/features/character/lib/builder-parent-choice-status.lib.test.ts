import { describe, expect, it } from 'vitest'

import {
  characterBuilderDependentChoiceMessages,
  DEPENDENT_CHOICE_KINDS,
  formatFieldMessage,
} from '@rpg/contracts'

import {
  DEPENDENT_KIND_HERITAGE,
  formatParentChoiceTitleMeta,
  MANAGE_HERITAGE_LABEL,
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

  it('exports explicit manage label from contracts messages', () => {
    expect(MANAGE_HERITAGE_LABEL).toBe(
      formatFieldMessage(characterBuilderDependentChoiceMessages.manageHeritage()),
    )
  })
})
