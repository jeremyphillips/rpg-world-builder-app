import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ORIGIN_LANGUAGES_CHOICE_ID, type ChoiceSet } from '@rpg/contracts'

import { CHOICE_SET_COMBOBOX_OPTION_THRESHOLD } from '../../../lib/choice-sets/choice-set-field.lib'
import { ChoiceSetField } from './choice-set-field'

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

const heritageChoiceSet = {
  id: 'species:srd-cc-5.2.1:elf:heritage',
  sourceType: 'species',
  sourceId: 'srd-cc-5.2.1:elf',
  choiceType: 'trait',
  label: 'Elven Heritage',
  min: 1,
  max: 1,
  options: [
    { id: 'high-elf', label: 'High Elf' },
    { id: 'wood-elf', label: 'Wood Elf' },
  ],
  required: true,
} satisfies ChoiceSet

const toolPoolChoiceSet = {
  id: 'class:srd-cc-5.2.1:bard:tools',
  sourceType: 'class',
  sourceId: 'srd-cc-5.2.1:bard',
  choiceType: 'toolProficiency',
  label: 'Artisan Tools',
  min: 1,
  max: 1,
  options: Array.from({ length: CHOICE_SET_COMBOBOX_OPTION_THRESHOLD + 1 }, (_, index) => ({
    id: `tool-${index}`,
    label: `Artisan Tool ${index + 1}`,
  })),
  required: true,
} satisfies ChoiceSet

describe('ChoiceSetField', () => {
  it('renders chip options for small multi-select ChoiceSets', () => {
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

  it('renders card radios for single-select ChoiceSets', () => {
    render(
      <ChoiceSetField choiceSet={heritageChoiceSet} value={[]} onValueChange={() => undefined} />,
    )

    expect(screen.getByRole('radio', { name: /High Elf/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Wood Elf/ })).toBeInTheDocument()
  })

  it('renders a searchable combobox for large option pools', () => {
    render(
      <ChoiceSetField choiceSet={toolPoolChoiceSet} value={[]} onValueChange={() => undefined} />,
    )

    expect(screen.getByRole('combobox', { name: 'Artisan Tools' })).toBeInTheDocument()
  })

  it('updates multi-select selections through onValueChange', async () => {
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

  it('updates single-select selections through onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ChoiceSetField choiceSet={heritageChoiceSet} value={[]} onValueChange={onValueChange} />,
    )

    await user.click(screen.getByRole('radio', { name: /High Elf/ }))
    expect(onValueChange).toHaveBeenCalledWith(['high-elf'])
  })

  itAxe('has no axe accessibility violations for multi-select chips', async () => {
    const { container } = render(
      <ChoiceSetField
        choiceSet={originLanguagesChoiceSet}
        value={['elvish', 'dwarvish']}
        onValueChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations for single-select cards', async () => {
    const { container } = render(
      <ChoiceSetField
        choiceSet={heritageChoiceSet}
        value={['high-elf']}
        onValueChange={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations for searchable pools', async () => {
    const { container } = render(
      <ChoiceSetField choiceSet={toolPoolChoiceSet} value={[]} onValueChange={() => undefined} />,
    )

    await expectNoAxeViolations(container)
  })
})
