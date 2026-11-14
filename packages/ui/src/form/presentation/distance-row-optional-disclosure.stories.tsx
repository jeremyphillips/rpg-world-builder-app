'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { JoinedPairFieldConfig } from '../field-config'
import { AnatomyFieldRowCluster } from './anatomy-field-row-cluster.client'

const LONG_HINT = 'Disadvantage beyond normal range.'

const reachField: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Melee reach',
  width: '1/3',
  start: {
    kind: 'select',
    name: 'reach',
    options: [5, 10, 15].map((feet) => ({ value: feet, label: String(feet) })),
    digits: 2,
    ariaLabel: 'Reach value',
  },
  end: { kind: 'label', text: 'ft.', ariaLabel: 'Reach unit' },
}

const normalRangeField: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Normal range',
  width: '1/2',
  required: true,
  start: {
    kind: 'select',
    name: 'range.normal',
    options: [60, 120, 240].map((feet) => ({ value: feet, label: String(feet) })),
    digits: 3,
    ariaLabel: 'Normal range value',
  },
  end: { kind: 'label', text: 'ft.', ariaLabel: 'Normal range unit' },
}

const longRangeField: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Long range',
  width: '1/2',
  hint: { text: LONG_HINT, position: 'below-control' },
  start: {
    kind: 'select',
    name: 'range.long',
    options: [80, 150, 240].map((feet) => ({ value: feet, label: String(feet) })),
    digits: 3,
    allowCustom: true,
    clearable: true,
    ariaLabel: 'Long range value',
  },
  end: { kind: 'label', text: 'ft.', ariaLabel: 'Long range unit' },
  optionalDisclosure: {
    addLabel: 'Add long range',
    expandWhenPopulated: true,
  },
}

const schema = z.object({
  reach: z.number().optional(),
  range: z.object({
    normal: z.number(),
    long: z.number().optional(),
  }),
})

function DistanceRowFixture() {
  return (
    <div className="max-w-3xl rounded-md border border-border bg-field-container p-4">
      <Form
        schema={schema}
        id="distance-row"
        defaultValues={{ reach: 5, range: { normal: 120, long: 240 } }}
        onSubmit={() => undefined}
        fields={[
          {
            kind: 'group',
            heading: { label: 'Distance' },
            fields: [
              {
                kind: 'row',
                fields: [
                  reachField,
                  {
                    kind: 'slot',
                    name: 'distanceRangeCluster',
                    width: '2/3',
                    render: () => (
                      <AnatomyFieldRowCluster
                        idPrefix="distance-row"
                        fields={[normalRangeField, longRangeField]}
                      />
                    ),
                  },
                ],
              },
            ],
          },
        ]}
      />
    </div>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/DistanceRowOptionalDisclosure',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Regression: dual-mode distance row (reach 1/3 + range cluster 2/3) with optional long-range disclosure.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const DualModeDistanceRow: Story = {
  render: () => <DistanceRowFixture />,
}
