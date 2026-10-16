import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormSectionProvider } from '../../form/context/form-section.context'
import {
  FieldRecommendationGroupView,
  FieldRecommendationInline,
} from './field-recommendation.client'
import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { Input } from './input.client'

const sampleGroup = {
  sourceLabel: 'Weapons from selected proficiencies',
  items: [
    {
      id: 'dagger',
      label: 'Dagger',
      action: { label: '+ Add', ariaLabel: 'Add Dagger', onClick: vi.fn() },
    },
    {
      id: 'shortsword',
      label: 'Shortsword',
      action: { label: '+ Add', ariaLabel: 'Add Shortsword', onClick: vi.fn() },
    },
  ],
}

function renderGroup(density: 'comfortable' | 'compact' = 'comfortable') {
  return render(
    <FormSectionProvider density={density}>
      <FieldRecommendationGroupView group={sampleGroup} />
    </FormSectionProvider>,
  )
}

describe('FieldRecommendationGroupView', () => {
  it('renders source label and adjacent label/action pairs', () => {
    renderGroup()
    expect(screen.getByText('Weapons from selected proficiencies')).toBeInTheDocument()
    const daggerLabel = screen.getByText('Dagger')
    const pair = daggerLabel.closest('[data-field-recommendation-item]')
    expect(pair).toHaveClass('inline-flex', 'max-w-full')
    expect(pair?.querySelector('button')).toHaveTextContent('+ Add')
  })

  it('uses InlineMetadata aria-hidden separators prefixed on later items', () => {
    const { container } = renderGroup()
    const separators = container.querySelectorAll('[data-inline-metadata-separator]')
    expect(separators).toHaveLength(1)
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true')
    const shortswordItem = screen
      .getByText('Shortsword')
      .closest('[data-field-recommendation-item]')
    expect(shortswordItem?.parentElement?.querySelector('[data-inline-metadata-separator]')).toBe(
      separators[0],
    )
  })

  it('applies caption typography on the items host for separator metrics', () => {
    const { container } = renderGroup()
    const metadataRoot = container.querySelector(
      '[data-field-recommendation-group] > span:last-child',
    )
    expect(metadataRoot).toHaveClass('text-style-caption')
  })

  it('uses the same accent text button scale as field recommendations', () => {
    renderGroup('compact')
    const addButton = screen.getByRole('button', { name: 'Add Dagger' })
    expect(addButton).toHaveClass(
      'text-action-standalone',
      'text-primary',
      'ui-button__text--sm-compact',
    )
  })

  it('invokes the item action on click', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <FormSectionProvider density="comfortable">
        <FieldRecommendationGroupView
          group={{
            items: [
              {
                id: 'dagger',
                label: 'Dagger',
                action: { label: '+ Add', ariaLabel: 'Add Dagger', onClick },
              },
            ],
          }}
        />
      </FormSectionProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Add Dagger' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders above a collection body fixture', () => {
    render(
      <FormSectionProvider density="comfortable">
        <div>
          <FieldRecommendationGroupView group={sampleGroup} />
          <ul aria-label="Equipment list">
            <li>Existing row</li>
          </ul>
        </div>
      </FormSectionProvider>,
    )

    const group = screen.getByText('Dagger').closest('[data-field-recommendation-group]')
    const list = screen.getByRole('list', { name: 'Equipment list' })
    expect(group!.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('FieldRecommendationInline parity', () => {
  it('keeps single field recommendation presentation', () => {
    render(
      <Field.Root id="languages" hint="Choose languages." anatomy>
        <FieldLayout
          label={<Field.Label>Languages</Field.Label>}
          recommendation={{
            content: 'Recommended for this creature type: Dragon',
            action: { label: '+ Add', ariaLabel: 'Add Draconic', onClick: vi.fn() },
          }}
          control={<Input aria-label="Languages control" />}
        />
      </Field.Root>,
    )

    const addButton = screen.getByRole('button', { name: 'Add Draconic' })
    expect(addButton).toHaveClass('ui-button__text--sm-compact', 'text-primary')
    expect(screen.getByText(/Recommended for this creature type/)).toBeInTheDocument()
  })
})
