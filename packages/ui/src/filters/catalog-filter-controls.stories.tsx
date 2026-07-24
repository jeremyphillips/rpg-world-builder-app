import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo } from 'react'

import {
  CatalogFilterControls,
  createChipsFilter,
  createEqualsFilter,
  createFilterSchema,
  createPopoverFilter,
  shallowArrayEqual,
  useFilterState,
} from './index'

type DemoRow = {
  level: number
  school: string
  castingTime: string
}

type DemoFilterState = {
  levels?: number[]
  school?: string
  mechanics?: {
    castingTimes: string[]
    traits: string[]
  }
}

const ALL_SCHOOL = '__all__'

const demoRows: DemoRow[] = [
  { level: 1, school: 'evocation', castingTime: 'action' },
  { level: 2, school: 'abjuration', castingTime: 'bonus-action' },
  { level: 3, school: 'evocation', castingTime: 'action' },
]

function createDemoSchema() {
  return createFilterSchema<DemoRow, DemoFilterState>([
    createChipsFilter<DemoRow, DemoFilterState, 'levels'>({
      id: 'levels',
      label: 'Levels',
      selectionMode: 'multiple',
      allValue: '__all__',
      isValueConstraining: (value) => Array.isArray(value) && value.length > 0,
      isValueEqual: shallowArrayEqual,
      toChipValues: (value) => (!value || value.length === 0 ? ['__all__'] : value.map(String)),
      fromChipValues: (_current, next) => {
        if (next.includes('__all__')) return []
        return next.map(Number).filter((level) => Number.isFinite(level))
      },
      options: [
        { value: '__all__', label: 'All' },
        { value: '1', label: '1st' },
        { value: '2', label: '2nd' },
        { value: '3', label: '3rd' },
      ],
      matches: (row, value) => {
        if (!Array.isArray(value) || value.length === 0) return true
        return value.includes(row.level)
      },
    }),
    createEqualsFilter<DemoRow, DemoFilterState, 'school', string>({
      id: 'school',
      label: 'School',
      defaultValue: ALL_SCHOOL,
      layout: 'inline',
      showAllOption: false,
      options: [
        { value: ALL_SCHOOL, label: 'All' },
        { value: 'evocation', label: 'Evocation' },
        { value: 'abjuration', label: 'Abjuration' },
      ],
      getValue: (row) => row.school,
      isValueConstraining: (value) => value !== ALL_SCHOOL,
    }),
    createPopoverFilter<DemoRow, DemoFilterState, 'mechanics'>({
      id: 'mechanics',
      label: 'Mechanics',
      triggerLabel: (count) =>
        count === 0 ? 'Casting & mechanics' : `Casting & mechanics · ${count}`,
      triggerAriaLabel: 'Casting and mechanics filters',
      defaultValue: { castingTimes: [], traits: [] },
      groups: [
        {
          id: 'castingTimes',
          label: 'Casting time',
          options: [
            { value: 'action', label: 'Action' },
            { value: 'bonus-action', label: 'Bonus action' },
          ],
        },
        {
          id: 'traits',
          label: 'Traits',
          options: [{ value: 'concentration', label: 'Concentration' }],
        },
      ],
      matches: () => true,
    }),
  ])
}

function CatalogFilterControlsDemo() {
  const schema = useMemo(() => createDemoSchema(), [])
  const { state, setValue } = useFilterState(schema)

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <CatalogFilterControls.Primary
        schema={schema}
        layout={{ primaryFieldIds: ['levels'] }}
        state={state}
        data={demoRows}
        idPrefix="catalog-demo-primary"
        onValueChange={setValue}
      />
      <CatalogFilterControls.FilterRow
        schema={schema}
        layout={{ filterRowFieldIds: ['school', 'mechanics'] }}
        state={state}
        data={demoRows}
        idPrefix="catalog-demo-filter-row"
        onValueChange={setValue}
      />
      <pre className="rounded-md border border-border bg-sunken p-3 text-xs text-muted-foreground">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  )
}

const meta = {
  title: 'Filters/CatalogFilterControls',
  component: CatalogFilterControlsDemo,
} satisfies Meta<typeof CatalogFilterControlsDemo>

export default meta

type Story = StoryObj<typeof meta>

export const SpellPickerLayout: Story = {
  render: () => <CatalogFilterControlsDemo />,
}
