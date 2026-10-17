import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FormSectionProvider } from '../../form/context/form-section.context'
import { FieldRecommendationGroupView } from './field-recommendation.client'
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
  it('renders source label and inline outline actions with + label copy', () => {
    renderGroup()
    expect(screen.getByText('Weapons from selected proficiencies')).toBeInTheDocument()
    const daggerButton = screen.getByRole('button', { name: 'Add Dagger' })
    expect(daggerButton).toHaveAttribute('data-field-recommendation-item', '')
    expect(daggerButton).toHaveTextContent('+ Dagger')
    expect(screen.getByRole('button', { name: 'Add Shortsword' })).toHaveTextContent('+ Shortsword')
  })

  it('does not render metadata separators between actions', () => {
    const { container } = renderGroup()
    expect(container.querySelectorAll('[data-inline-metadata-separator]')).toHaveLength(0)
  })

  it('uses sm compact outline buttons for collection actions', () => {
    renderGroup('compact')
    const addButton = screen.getByRole('button', { name: 'Add Dagger' })
    expect(addButton).toHaveClass('ui-button--outline', 'ui-button--sm-compact')
  })

  it('does not show bulk add for two or fewer actionable items', () => {
    render(
      <FormSectionProvider density="comfortable">
        <FieldRecommendationGroupView
          group={{
            ...sampleGroup,
            bulkAction: {
              label: 'Add all',
              ariaLabel: 'Add all 2 recommended weapons',
              onClick: vi.fn(),
            },
          }}
        />
      </FormSectionProvider>,
    )
    expect(screen.queryByRole('button', { name: 'Add all 2 recommended weapons' })).toBeNull()
  })

  it('shows sm ghost bulk add inline after the source label for three or more items', () => {
    const onBulk = vi.fn()
    render(
      <FormSectionProvider density="comfortable">
        <FieldRecommendationGroupView
          group={{
            sourceLabel: 'Weapons from selected proficiencies',
            bulkAction: {
              label: 'Add all',
              ariaLabel: 'Add all 3 recommended weapons',
              onClick: onBulk,
            },
            items: [
              ...sampleGroup.items,
              {
                id: 'shortbow',
                label: 'Shortbow',
                action: { label: '+ Add', ariaLabel: 'Add Shortbow', onClick: vi.fn() },
              },
            ],
          }}
        />
      </FormSectionProvider>,
    )

    const bulkButton = screen.getByRole('button', { name: 'Add all 3 recommended weapons' })
    expect(bulkButton).toHaveTextContent('Add all')
    expect(bulkButton).toHaveClass('ui-button--ghost', 'ui-button--sm-compact')
    expect(bulkButton).toHaveAttribute('data-field-recommendation-bulk', '')
    const header = bulkButton.parentElement
    expect(header).toHaveClass('flex', 'flex-wrap', 'items-center')
    expect(header).toContainElement(screen.getByText('Weapons from selected proficiencies'))
  })

  it('counts only non-disabled items toward the bulk threshold', () => {
    render(
      <FormSectionProvider density="comfortable">
        <FieldRecommendationGroupView
          group={{
            sourceLabel: 'Recommendations',
            bulkAction: {
              label: 'Add all',
              ariaLabel: 'Add all 3 recommended weapons',
              onClick: vi.fn(),
            },
            items: [
              {
                id: 'a',
                label: 'Alpha',
                action: { label: '+ Add', ariaLabel: 'Add Alpha', onClick: vi.fn() },
              },
              {
                id: 'b',
                label: 'Bravo',
                disabled: true,
                action: { label: '+ Add', ariaLabel: 'Add Bravo', onClick: vi.fn() },
              },
              {
                id: 'c',
                label: 'Charlie',
                action: { label: '+ Add', ariaLabel: 'Add Charlie', onClick: vi.fn() },
              },
              {
                id: 'd',
                label: 'Delta',
                action: { label: '+ Add', ariaLabel: 'Add Delta', onClick: vi.fn() },
              },
            ],
          }}
        />
      </FormSectionProvider>,
    )
    expect(
      screen.getByRole('button', { name: 'Add all 3 recommended weapons' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Bravo' })).toBeDisabled()
  })

  it('invokes bulk action once on click', async () => {
    const onBulk = vi.fn()
    const user = userEvent.setup()
    render(
      <FormSectionProvider density="comfortable">
        <FieldRecommendationGroupView
          group={{
            bulkAction: {
              label: 'Add all',
              ariaLabel: 'Add all 3 recommended weapons',
              onClick: onBulk,
            },
            items: [
              {
                id: 'a',
                label: 'Alpha',
                action: { label: '+ Add', ariaLabel: 'Add Alpha', onClick: vi.fn() },
              },
              {
                id: 'b',
                label: 'Bravo',
                action: { label: '+ Add', ariaLabel: 'Add Bravo', onClick: vi.fn() },
              },
              {
                id: 'c',
                label: 'Charlie',
                action: { label: '+ Add', ariaLabel: 'Add Charlie', onClick: vi.fn() },
              },
            ],
          }}
        />
      </FormSectionProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Add all 3 recommended weapons' }))
    expect(onBulk).toHaveBeenCalledOnce()
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

    const group = screen
      .getByRole('button', { name: 'Add Dagger' })
      .closest('[data-field-recommendation-group]')
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
