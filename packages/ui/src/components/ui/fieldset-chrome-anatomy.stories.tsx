import type { Meta, StoryObj } from '@storybook/react-vite'

import { FieldLabelContent } from './field-label-content'
import { fieldLabelVariants, fieldSetInFlowLegendClasses } from './field.variants'
import { FieldsetChromeAnatomy, FieldsetChromeFrame } from './fieldset-chrome-anatomy'
import { TextField } from './text-field'

const meta = {
  title: 'Forms/Layout/FieldsetChromeFrame',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ContainerChrome: Story = {
  render: () => (
    <FieldsetChromeFrame
      chrome={{ variant: 'container' }}
      errorId="demo-fieldset-error"
      fieldsetProps={{ id: 'demo-fieldset' }}
    >
      <FieldsetChromeAnatomy
        hintId="demo-fieldset-hint"
        legend={
          <legend
            className={`${fieldSetInFlowLegendClasses} ${fieldLabelVariants({ size: 'md' })}`}
          >
            <FieldLabelContent label="Ability scores" />
          </legend>
        }
      >
        <TextField id="demo-score" label="Score" placeholder="15" />
      </FieldsetChromeAnatomy>
    </FieldsetChromeFrame>
  ),
}
