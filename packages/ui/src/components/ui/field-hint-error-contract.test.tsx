import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ComboboxField } from './combobox-field.client'
import { DiceFormulaField } from './dice-formula-field.client'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { FieldReadOnlyValueField } from './field-read-only-value.client'
import { InputSelectField } from './input-select-field.client'
import { JoinedPairFieldForm } from './joined-pair-field-form.client'
import { JsonField } from './json-field.client'
import { LevelRangeField } from './level-range-field.client'
import { MarkdownField } from './markdown-field.client'
import { RadioGroupField } from './radio-group-field'
import { RichTextField } from './rich-text-field'
import { RollValueField } from './roll-value-field.client'
import { SelectField } from './select-field'
import { TextField } from './text-field'
import { TextSuggestionsField } from './text-suggestions-field.client'

type HintPosition = 'below-label' | 'below-control'

type FieldCase = {
  name: string
  id: string
  render: (state: { hint: string; error?: string; hintPosition: HintPosition }) => ReactElement
}

const options = [{ value: 'a', label: 'A' }]

const cases: FieldCase[] = [
  {
    name: 'text',
    id: 'text',
    render: (state) => <TextField id="text" label="Name" {...state} />,
  },
  {
    name: 'text trailing action',
    id: 'trail',
    render: (state) => (
      <TextField
        id="trail"
        label="Name"
        trailingAction={{ label: 'Check', onAction: vi.fn() }}
        {...state}
      />
    ),
  },
  {
    name: 'select',
    id: 'select',
    render: (state) => (
      <SelectField id="select" label="Mode" options={options} value="a" {...state} />
    ),
  },
  {
    name: 'select inline',
    id: 'select-inline',
    render: (state) => (
      <SelectField
        id="select-inline"
        label="Mode"
        labelPosition="inline"
        options={options}
        value="a"
        {...state}
      />
    ),
  },
  {
    name: 'combobox',
    id: 'combo',
    render: (state) => (
      <ComboboxField
        id="combo"
        label="Spells"
        options={options}
        multiple={false}
        value="a"
        {...state}
      />
    ),
  },
  {
    name: 'joined pair',
    id: 'jump',
    render: (state) => (
      <JoinedPairFieldForm
        id="jump"
        label="Jump distance"
        {...state}
        start={{
          kind: 'select',
          id: 'jump-value',
          value: 10,
          options: [{ value: 10, label: '10' }],
          ariaLabel: 'Jump distance value',
          onChange: vi.fn(),
        }}
        end={{ kind: 'label', text: 'ft.', ariaLabel: 'Jump distance unit' }}
        startOccupant={{
          kind: 'select',
          name: 'distanceFeet',
          options: [{ value: 10, label: '10' }],
          ariaLabel: 'Jump distance value',
        }}
        endOccupant={{ kind: 'label', text: 'ft.', ariaLabel: 'Jump distance unit' }}
      />
    ),
  },
  {
    name: 'roll value',
    id: 'roll',
    render: (state) => (
      <RollValueField id="roll" label="Damage" parts={{}} onPartsChange={vi.fn()} {...state} />
    ),
  },
  {
    name: 'level range',
    id: 'levels',
    render: (state) => (
      <LevelRangeField
        id="levels"
        label="Levels"
        minId="levels-min"
        maxId="levels-max"
        minOptions={[{ value: '1', label: '1' }]}
        maxOptions={[{ value: '20', label: '20' }]}
        {...state}
      />
    ),
  },
  {
    name: 'input select',
    id: 'distance',
    render: (state) => (
      <InputSelectField
        id="distance"
        label="Distance"
        inputType="number"
        value={10}
        unit="ft"
        unitMode="label"
        fixedUnit="ft."
        onValueChange={vi.fn()}
        {...state}
      />
    ),
  },
  {
    name: 'dice formula',
    id: 'dice',
    render: (state) => <DiceFormulaField id="dice" label="Damage" {...state} />,
  },
  {
    name: 'radio group',
    id: 'radio',
    render: (state) => (
      <RadioGroupField
        id="radio"
        label="Size"
        options={[{ value: 'm', label: 'Medium' }]}
        {...state}
      />
    ),
  },
  {
    name: 'json',
    id: 'json',
    render: (state) => <JsonField id="json" label="Payload" value="{}" {...state} />,
  },
  {
    name: 'rich text',
    id: 'bio',
    render: (state) => <RichTextField id="bio" label="Biography" {...state} />,
  },
  {
    name: 'markdown',
    id: 'notes',
    render: (state) => <MarkdownField id="notes" label="Notes" value="" {...state} />,
  },
  {
    name: 'text suggestions',
    id: 'suggest',
    render: (state) => (
      <TextSuggestionsField
        id="suggest"
        label="Title"
        value=""
        suggestions={[]}
        onValueChange={vi.fn()}
        {...state}
      />
    ),
  },
  {
    name: 'read only',
    id: 'locked',
    render: (state) => (
      <FieldReadOnlyValueField id="locked" label="Locked" displayValue="10" {...state} />
    ),
  },
]

function describedByValues(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[aria-describedby]')].map(
    (node) => node.getAttribute('aria-describedby') ?? '',
  )
}

function expectDescribedBy(container: HTMLElement, id: string, mode: 'both' | 'error-only') {
  const values = describedByValues(container).filter(Boolean)
  expect(values.some((value) => value.split(' ').includes(`${id}-error`))).toBe(true)
  const mentionsHint = values.some((value) => value.split(' ').includes(`${id}-hint`))
  expect(mentionsHint).toBe(mode === 'both')
}

describe('field hint and error presentation', () => {
  it.each(cases)(
    '$name keeps a below-label hint beside the error',
    ({ id, render: renderField }) => {
      const { container } = render(
        renderField({ hint: 'Helper.', error: 'Required.', hintPosition: 'below-label' }),
      )
      expect(screen.getByText('Helper.')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Required.')
      expectDescribedBy(container, id, 'both')
    },
  )

  it.each(cases)(
    '$name replaces a below-control hint with the error',
    ({ id, render: renderField }) => {
      const { container, rerender } = render(
        renderField({ hint: 'Helper.', error: 'Required.', hintPosition: 'below-control' }),
      )
      expect(screen.queryByText('Helper.')).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Required.')
      expectDescribedBy(container, id, 'error-only')

      rerender(renderField({ hint: 'Helper.', hintPosition: 'below-control' }))
      expect(screen.getByText('Helper.')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    },
  )

  it('places a joined-pair row hint in the message region and replaces it when invalid', () => {
    const field = (error?: string) => (
      <FieldRowAnatomyProvider>
        <JoinedPairFieldForm
          id="jump"
          label="Jump distance"
          hint="Helper."
          hintPosition="below-control"
          error={error}
          start={{
            kind: 'select',
            id: 'jump-value',
            value: 10,
            options: [{ value: 10, label: '10' }],
            ariaLabel: 'Jump distance value',
            onChange: vi.fn(),
          }}
          end={{ kind: 'label', text: 'ft.', ariaLabel: 'Jump distance unit' }}
          startOccupant={{
            kind: 'select',
            name: 'distanceFeet',
            options: [{ value: 10, label: '10' }],
            ariaLabel: 'Jump distance value',
          }}
          endOccupant={{ kind: 'label', text: 'ft.', ariaLabel: 'Jump distance unit' }}
        />
      </FieldRowAnatomyProvider>
    )

    const { container, rerender } = render(field())
    const messageRegion = container.querySelector('[data-field-message-region]')
    expect(messageRegion).toContainElement(screen.getByText('Helper.'))

    rerender(field('Required.'))
    expect(screen.queryByText('Helper.')).not.toBeInTheDocument()
    expect(container.querySelector('[data-field-message-region]')).toContainElement(
      screen.getByRole('alert'),
    )
  })
})
