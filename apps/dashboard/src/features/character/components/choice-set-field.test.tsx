import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ORIGIN_LANGUAGES_CHOICE_ID, type ChoiceSet } from '@rpg/contracts'

import { ChoiceSetField } from './choice-set-field.client'

const originLanguagesChoiceSet = {
  id: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
  sourceType: 'ruleset',
  sourceId: 'srd-cc-5.2.1',
  choiceType: 'language',
  label: 'Origin Languages',
  min: 2,
  max: 2,
  options: [
    { id: 'common', label: 'Common' },
    { id: 'elvish', label: 'Elvish' },
    { id: 'dwarvish', label: 'Dwarvish' },
  ],
  required: true,
} satisfies ChoiceSet

describe('ChoiceSetField', () => {
  it('renders options from the resolved ChoiceSet', () => {
    render(
      <ChoiceSetField
        choiceSet={originLanguagesChoiceSet}
        value={[]}
        onValueChange={() => undefined}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Common' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Elvish' })).toBeInTheDocument()
  })

  it('updates selections through onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ChoiceSetField
        choiceSet={originLanguagesChoiceSet}
        value={[]}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Elvish' }))
    expect(onValueChange).toHaveBeenCalledWith(['elvish'])
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ChoiceSetField
        choiceSet={originLanguagesChoiceSet}
        value={['elvish', 'dwarvish']}
        onValueChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
