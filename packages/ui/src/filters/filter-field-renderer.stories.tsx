import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { createEqualsFilter, createPopoverFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import { FilterChromeProvider } from './filter-chrome.context'
import { FilterFieldRenderer, type FilterRenderContext } from './filter-field-renderer.client'

type DemoRow = { school: string }
type DemoState = {
  school?: string
  mechanics?: { traits: string[] }
}

const schema = createFilterSchema<DemoRow, DemoState>([
  createEqualsFilter<DemoRow, DemoState, 'school', string>({
    id: 'school',
    label: 'School',
    layout: 'inline',
    defaultValue: 'all',
    showAllOption: false,
    options: [
      { value: 'all', label: 'All' },
      { value: 'evocation', label: 'Evocation' },
      { value: 'transmutation', label: 'Transmutation' },
    ],
    getValue: (row) => row.school,
  }),
  createPopoverFilter<DemoRow, DemoState, 'mechanics'>({
    id: 'mechanics',
    label: 'Casting & mechanics',
    triggerAriaLabel: 'Casting and mechanics filters',
    triggerLabel: (count) =>
      count === 0 ? 'Casting & mechanics' : `Casting & mechanics · ${count}`,
    defaultValue: { traits: [] },
    groups: [
      {
        id: 'traits',
        label: 'Traits',
        options: [
          { value: 'concentration', label: 'Concentration' },
          { value: 'ritual', label: 'Ritual' },
        ],
      },
    ],
    matches: () => true,
  }),
])

function WidthStabilityDemo() {
  const [state, setState] = useState<DemoState>({ school: 'all', mechanics: { traits: [] } })

  return (
    <FilterChromeProvider>
      <div className="flex items-end gap-3 p-4">
        {schema.fields.map((field) => {
          const context: FilterRenderContext<DemoRow, DemoState> = {
            schema,
            state,
            idPrefix: 'width',
            onValueChange: (id, value) => {
              setState((current) => ({ ...current, [id]: value }))
            },
          }
          return (
            <FilterFieldRenderer
              key={field.id}
              field={field}
              controlId={`width-${field.id}`}
              context={context}
            />
          )
        })}
      </div>
    </FilterChromeProvider>
  )
}

const meta = {
  title: 'Filters/FilterFieldRenderer',
  component: WidthStabilityDemo,
} satisfies Meta<typeof WidthStabilityDemo>

export default meta
type Story = StoryObj<typeof meta>

export const WidthStability: Story = {
  render: () => <WidthStabilityDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const school = canvas.getByRole('combobox', { name: 'School' })
    const schoolWidth = school.getBoundingClientRect().width
    await expect(schoolWidth).toBeGreaterThan(0)

    await userEvent.click(school)
    await userEvent.click(canvas.getByRole('option', { name: 'Transmutation' }))
    await expect(
      canvas.getByRole('combobox', { name: 'School' }).getBoundingClientRect().width,
    ).toBe(schoolWidth)

    const popover = canvas.getByRole('button', { name: 'Casting and mechanics filters' })
    const popoverWidth = popover.getBoundingClientRect().width
    await expect(popoverWidth).toBeGreaterThan(0)
    await userEvent.click(popover)
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Concentration' }))
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Ritual' }))
    await expect(
      canvas.getByRole('button', { name: 'Casting and mechanics filters' }).getBoundingClientRect()
        .width,
    ).toBe(popoverWidth)
  },
}
