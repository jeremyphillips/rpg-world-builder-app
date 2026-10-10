import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import {
  CHOICE_CONTROL_INDICATOR_SIZE_SPECS,
  CHOICE_CONTROL_KIND_SPECS,
  UI_CHOICE_CONTROL_BLOCK_CLASS,
} from './choice-control.styles'
import {
  RADIO_CARD_INDICATOR_REFERENCE_ROWS,
  radioCardDecorativeControlClasses,
  radioGroupItemControlClasses,
} from './choice-control.variants'
import { RadioGroup, RadioGroupItem } from './radio-group.client'

const meta = {
  title: 'Forms/Controls/RadioGroup',
  component: RadioGroup,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_CHOICE_CONTROL_BLOCK_CLASS} with \`ui-choice-control--radio\` owns circle indicators; RadioCard decorations add \`ui-choice-control--indicator-*\` size modifiers.`,
      },
    },
  },
  render: (args) => (
    <RadioGroup aria-label="Difficulty" {...args}>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="easy" value="easy" />
        <label htmlFor="easy" className="text-sm">
          Easy
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="normal" value="normal" />
        <label htmlFor="normal" className="text-sm">
          Normal
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem id="deadly" value="deadly" />
        <label htmlFor="deadly" className="text-sm">
          Deadly
        </label>
      </div>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithSelection: Story = { args: { defaultValue: 'normal' } }

export const Disabled: Story = { args: { disabled: true, defaultValue: 'normal' } }

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => {
    const radioSpec = CHOICE_CONTROL_KIND_SPECS.find((entry) => entry.kind === 'radio')!
    const indicatorRows = RADIO_CARD_INDICATOR_REFERENCE_ROWS.map((row) => {
      const sizeSpec = CHOICE_CONTROL_INDICATOR_SIZE_SPECS.find(
        (spec) => spec.size === row.indicatorSize,
      )!
      return {
        key: row.key,
        sample: (
          <div
            className={radioCardDecorativeControlClasses({ indicatorSize: row.indicatorSize })}
            data-semantic-class-target
            data-state="checked"
          />
        ),
        propsLabel: row.propsLabel,
        className: radioCardDecorativeControlClasses({ indicatorSize: row.indicatorSize }),
        keyValues: `control size: ${sizeSpec.controlSize}`,
        useCase: row.useCase,
      }
    })

    return (
      <ClassReferenceTable
        rows={[
          {
            key: 'radio-group-item',
            sample: (
              <RadioGroup aria-label="Reference">
                <RadioGroupItem
                  id="ref-radio"
                  value="ref"
                  aria-label="Reference"
                  data-semantic-class-target
                  defaultChecked
                />
              </RadioGroup>
            ),
            propsLabel: 'RadioGroupItem',
            className: radioGroupItemControlClasses(),
            keyValues: `control size: ${radioSpec.controlSize}`,
            useCase: radioSpec.useCase,
          },
          ...indicatorRows,
        ]}
      />
    )
  },
}
